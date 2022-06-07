import React, { Component } from 'react';
import custom from '../custom.css'
import { Button } from 'reactstrap';

const memStatus = (status) => ( 'memory-block-' + status ) //将状态转换为CSS样式
const taskStatus = (status) => ('task-' + status)       //同上
const PCB = [0, -1, -1, -1, -1, -1, -1, -1];
const taskListInit = [
    {
        id: 1,
        process: 1,
        action: 'request',
        memorySize: 130,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 2,
        process: 2,
        action: 'request',
        memorySize: 60,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 3,
        process: 3,
        action: 'request',
        memorySize: 100,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 4,
        process: 2,
        action: 'release',
        memorySize: 60,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 5,
        process: 4,
        action: 'request',
        memorySize: 200,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 6,
        process: 3,
        action: 'release',
        memorySize: 100,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 7,
        process: 1,
        action: 'release',
        memorySize: 130,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 8,
        process: 5,
        action: 'request',
        memorySize: 140,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 9,
        process: 6,
        action: 'request',
        memorySize: 60,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 10,
        process: 7,
        action: 'request',
        memorySize: 50,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 11,
        process: 6,
        action: 'release',
        memorySize: 60,
        status: 'todo',
        memAddrFrom: -1,
    },
    {
        id: 0,
        process: 0,
        action: '',
        memorySize: 0,
        status: '',
        memAddrFrom: -1,
    },
]
export class FirstFitAlgorithm extends Component {
    static displayName = FirstFitAlgorithm.name;
    nowTaskAt = 0;
    state = {
        MemList: [],
        TaskList : taskListInit//任务队列
    }
    constructor() {
        super()
        for (var i = 0; i < 64; i++) {
            this.state.MemList.push({
                id: i,
                status: 'free'
            })
        }
    }

    moveOn = () => {
        //读取当前指向的任务
        if (this.nowTaskAt > 10) return;
        const nowTask = this.state.TaskList[this.nowTaskAt];
        //设置当前任务为allocated
        this.setState({
            TaskList: this.state.TaskList.map((item, idx) => (idx === this.nowTaskAt ? { ...item, status: 'running' } : item))
        }, () => {
        })
        //分配内存
       // console.log('***********');
        if (nowTask['action'] == 'request') {
            let freeMemBlockCount = 0;
            let prev = 0;
            for (let i = 0; i < 64; i++) {
                if (this.state.MemList[i].status == 'free') {
                    if (prev === 0 || prev == i - 1) {
                        console.log(i, 'free');
                        freeMemBlockCount++;
                        prev = i;
                    }
                } else {
                    freeMemBlockCount = 0;
                    prev = i;
                }
                if (freeMemBlockCount * 10 === nowTask.memorySize) {
                    PCB[nowTask.process] = i + 1 - freeMemBlockCount;//起始地址
                    this.setState({
                        MemList: this.state.MemList.map(item => item.id
                            >= PCB[nowTask.process]
                            && item.id <= i ? { ...item, status: 'used' } : item),
                    })
                    break;
                }
                }
            }
        //释放内存
        else {
            //console.log('nowTask.memAddrFrom', PCB[nowTask.id])
            //console.log('nowTask.memorySize', nowTask.memorySize)
            //console.log('nowTaskAt', this.nowTaskAt)
            this.setState({
                MemList: this.state.MemList.map(item =>
                    item.id >= PCB[nowTask.process] && item.id <
                        PCB[nowTask.process] + (nowTask.memorySize) / 10 ?
                        { ...item, status: 'free' } : item)
            })
        }
        //指向下一个任务
        this.nowTaskAt++;
    }
    clear = () => {
        this.setState({
            MemList: this.state.MemList.map(item => ({ ...item, status: 'free' })),
            TaskList: taskListInit
        })
        this.nowTaskAt = 0;
    }
    
    render() {
        return (
            <div style={{ 'display': 'block' }}>
                <div>
                    <h3>首次适应算法</h3>
                </div>
                <div className="container">
                    <div><h5 style={{ 'padding': '10px' }}>内存可视化：</h5></div>

                        <div className="memory-container">
                        {this.state.MemList.map(item => (
                            <div key={item.id} className={memStatus(item.status)}>
                                    {item.id}
                                </div>
                            ))}
                        </div>

                    <div><h5 style={{ 'padding': '10px' }}>任务队列：</h5></div>

                    <div>
                        {this.state.TaskList.map(item => item.memorySize>0?(
                            <div className={taskStatus(item.status)}>#{item.process} {item.action} {item.memorySize}k</div>
                            ):null)}
                        </div>


                    {/*/////////////////////////////////////static///////////////////////////////////////////*/}


                    <div><h5 style={{ 'padding': '10px' }}>说明：</h5></div>
                    <div >
                        <div>10k 空闲块:<div className="memory-block-free"> </div></div>
                        <div>10k 已占用块:<div className="memory-block-used"> </div></div>
                        <div>待分配任务:<div className="task-todo"> </div></div>
                        <div>已分配任务:<div className="task-running"> </div></div>
                        <div>点击Step按钮按步执行</div>
                        <div>点击Reset按钮清空状态</div>   
                    </div>
                    <div style={{ 'margin-left': '20px' }}>
                        <div><Button color="primary" onClick={this.moveOn}>Step</Button> </div>
                        <div><Button color="danger" onClick={this.clear}>Reset</Button></div>
                    </div>
                </div>
            </div>
        );
    }
}

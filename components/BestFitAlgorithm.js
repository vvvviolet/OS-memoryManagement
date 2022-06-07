import React, { Component } from 'react';
import custom from '../custom.css';
import { Button, Table } from 'reactstrap';
import { flushSync } from 'react-dom'

const TaskListInit = [
    {
        id: 1,
        process: 1,
        action: 'request',
        memorySize: 130,
        status: 'waiting',
    },
    {
        id: 2,
        process: 2,
        action: 'request',
        memorySize: 60,
        status: 'waiting',

    },
    {
        id: 3,
        process: 3,
        action: 'request',
        memorySize: 100,
        status: 'waiting',

    },
    {
        id: 4,
        process: 2,
        action: 'release',
        memorySize: 60,
        status: 'waiting',

    },
    {
        id: 5,
        process: 4,
        action: 'request',
        memorySize: 200,
        status: 'waiting',

    },
    {
        id: 6,
        process: 3,
        action: 'release',
        memorySize: 100,
        status: 'waiting',

    },
    {
        id: 7,
        process: 1,
        action: 'release',
        memorySize: 130,
        status: 'waiting',

    },
    {
        id: 8,
        process: 5,
        action: 'request',
        memorySize: 140,
        status: 'waiting',

    },
    {
        id: 9,
        process: 6,
        action: 'request',
        memorySize: 60,
        status: 'waiting',

    },
    {
        id: 10,
        process: 7,
        action: 'request',
        memorySize: 50,
        status: 'waiting',

    },
    {
        id: 11,
        process: 6,
        action: 'release',
        memorySize: 60,
        status: 'waiting',

    },
    {
        id: 0,
        process: 0,
        action: '',
        memorySize: 0,
        status: '',

    },
];

function sortBySize(a,b) {
    return a.size - b.size;
}
export class BestFitAlgorithm extends Component {
    static displayName = BestFitAlgorithm.name;
    nowTaskAt = 0;
    memListOrderBySize = [];
    memListMap = [0, -1, -1, -1, -1, -1, -1, -1];

    //记录实际内存起始地址
    state = {
        MemList: [],
        TaskList: TaskListInit
    };
    constructor() {
        super()
        for (var i = 0; i < 64; i++) {
            this.state.MemList.push({
                id: i,
                status: 'free'
            })
        }
        //最开始是一整块内存
        this.memListOrderBySize.push({
            addr: 0,
            size:640
        })
    }
    tidy = () => {
        let memList = this.state.MemList;
        for (let i = 0; i < 64; i++) {
            if (memList[i].status === 'free') {
               // console.log('i=', i)
                let size = 1;
                i++;
                for (; i <= 64; i++) {
                   // console.log('i=', i)
                   // console.log('size=', size)
                    if (i>=64||memList[i].status !== 'free') {
                        this.memListOrderBySize.push({
                            addr: i-size,
                            size: size*10,
                        })
                        //console.log('push addr',i-size)
                        //console.log('push size',size*10)
                        break;
                    }
                    size++;
                }
            }
        }
        this.memListOrderBySize.sort(sortBySize);
        //console.log('tidy',this.memListOrderBySize)
    }
    /* BFA分配 */

    step = () => {
        if (this.nowTaskAt > 10) return;
        //取当前任务（只读）
        let nowTask = this.state.TaskList[this.nowTaskAt];
        this.setState({
            TaskList: this.state.TaskList.map((item, idx) => idx === this.nowTaskAt ? ({ ...item, status: 'done' }) : item)
        })
        //分配
        //memListMap[nowTask.process]当前任务占用空间首地址
        //nowTask.memorySize 当前任务占用空间
        //从全部空闲区中找出能满足作业要求的、且大小最小的空闲分区，这种方法能使碎片尽量小
       

        if (nowTask.action === 'request') {
            for (let i = 0; i < this.memListOrderBySize.length; i++) {
                if (this.memListOrderBySize[i].size >= nowTask.memorySize) {
                    //记录每个任务占用内存起始地址
                    this.memListMap[nowTask.process] = this.memListOrderBySize[i].addr;
                    flushSync(() => {
                        this.setState({
                            MemList: this.state.MemList.map
                                (item => item.id >= this.memListOrderBySize[i].addr && item.id < this.memListOrderBySize[i].addr + nowTask.memorySize / 10 ? { ...item, status: 'used' } : item)
                        });
                    }
                    )
                    break;
                }
            }
        }
        //回收
        else {
            flushSync(() => {
                this.setState({
                    MemList: this.state.MemList.map(item => (item.id >= this.memListMap[nowTask.process] && item.id < (this.memListMap[nowTask.process] + nowTask.memorySize/10) ? { ...item, status: 'free' } : item))
                });
            })
        }
        this.memListOrderBySize.length = 0;
        this.tidy();
        console.log('memList after tidy', this.memListOrderBySize);
        //指向下一个任务
        this.nowTaskAt++;
    }

    clear = () => {
        this.setState({
            MemList: this.state.MemList.map(item =>({ ...item, status: 'free' })),
            TaskList: TaskListInit
        })
        this.nowTaskAt = 0;
        this.memListOrderBySize.length = 0;
        this.memListOrderBySize.push({
            addr: 0,
            size: 640
        })
    }

    render() {
        return (
            <div style={{ 'display': 'block' }}>
                <div>
                    <h3 >最佳适应算法 <Button color="primary" onClick={this.step}>Step</Button><span> </span><Button color="danger" onClick={this.clear}>Reset</Button></h3>
                </div>
                <div className="container">
                    <div><h5 style={{ 'padding': '10px' }}>内存块状态：</h5></div>
                    <div className="memory-container">
                        <Table size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>状态</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.MemList.map(item => (
                                    <tr>
                                        <th scope="row">{item.id}</th>
                                        <td className={item.status}>{item.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div><h5 style={{ 'padding': '10px' }}>任务队列：</h5></div>
                <div className='task'>
                        <Table size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>process ID</th>
                                    <th>action</th>
                                    <th>memory size</th>
                                    <th>process status</th>
                                </tr>
                            </thead>
                            <tbody >
                                {this.state.TaskList.map(item => item.id !== 0 ? (
                                    <tr>
                                        <th scope="row">{item.id}</th>
                                        <td >{item.process}</td>
                                        <td className={item.action}>{item.action}</td>
                                        <td >{item.memorySize}k</td>
                                        <td className={item.status}>{item.status}</td>
                                    </tr>
                                ):null)}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }
}

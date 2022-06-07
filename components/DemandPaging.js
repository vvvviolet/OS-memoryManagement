import React, { Component } from 'react';
import {
    Card, Progress, Button, CardText, CardBody,
    CardTitle, CardSubtitle
} from 'reactstrap';
function getRandom(x, y) {
    return Math.round(Math.random() * (y - x) + x);
}
export class DemandPaging extends Component {
    static displayName = DemandPaging.name;
    state = {
        pageFaultRate : 0,
        pageFaultNums: 0,
        pages: [],
        instructions: [],
        instLeft:320,
    }
    IntervalID = 0;
    nowInstAt = 0;
    execOrder = [];
    pageVisitByFrequency = []
    constructor() {
        super();
        for (let i = 0; i < 320; i++) {
            this.state.instructions.push(i);
        }
      
        this.state.pages = [{
            entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
            status: 'normal'
        }, {
            entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
            status: 'normal'
        }, {
            entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
            status: 'normal'
        }, {
            entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
            status: 'normal'
        },
        ];
        this.state.instLeft = 320;
        //TO-DO：生成符合要求的随机访问序列
        //在0－319条指令之间，随机选取一个起始执行指令，如序号为m
        let m, m1, m2;
        for (; this.execOrder.length < 320;) {
            m = getRandom(0, 320);
           // console.log('m=',m)
            this.execOrder.push(m);
            if (m + 1 < 320) {
                this.execOrder.push(m + 1);
                //console.log('m+1=', m+1)
            }
            if (m - 1 > 0) {
                m1 = getRandom(0, m - 1);
                this.execOrder.push(m1);
                if(m1+1<320)
                    this.execOrder.push(m1 + 1);
            }
            if (m1 + 2 < 320) {
                m2 = getRandom(m1 + 2, 320);
                this.execOrder.push(m2);
                if (m2 + 1 < 320)
                    this.execOrder.push(m2 + 1);
            }
        }
        this.execOrder.length = 320;
        this.pageVisitByFrequency = [0, 1, 2, 3];
        //console.log('constructor',this.pageVisitByFrequency)
        //console.log(this.execOrder);
    }
    isInMemory = (inst) => {
        const pages = this.state.pages;
        //从最频繁访问的页开始查找
        for (let i = pages.length - 1; i >= 0; i--) {
            for (let j = 0; j < pages[i].entry.length; j++) {
                if (pages[i].entry[j] === inst) {
                    return i;
                }
            }
        }
        return -1;
    }
    isFull = () => {
        const pages = this.state.pages;
        //console.log('isFull',pages)
        for (let i = pages.length - 1; i >= 0; i--) {
            for (let j = 0; j < pages[i].entry.length; j++) {
                if (pages[i].entry[j] === -1) {
                    return false;
                }
            }
        }
        return true;
    }
    addToMemory = (inst) => {
        var pageNo = 0;
        var find = false;
        let pages = this.state.pages;
        for (let i = 3; i >= 0&&!find; i--) {
            for (let j = 0; j < 10; j++) {
                if (pages[i].entry[j] === -1) {
                    pageNo = i;
                    this.setState({
                        pages: this.state.pages.map((pg, idx) => idx === i ?
                            {
                                ...pg,
                                entry: pg.entry.map((item, idx) => idx === j ? inst:item)
                             } : pg)
                    })
                    find = true;
                    break;
                }
            }
        }
        return pageNo;
    }
    runByInterval = () => {
        if (this.state.instLeft === 0) return;
        this.setState({
            instLeft: this.state.instLeft - 1
        })
        this.setState({
            pages: this.state.pages.map((item, idx) => ({...item,status:(item.status==='replace'?'normal':'normal') }))
        })
        // 取当前指令
        let inst = this.state.instructions[this.execOrder[this.nowInstAt]];
        let pageNo = this.isInMemory(inst) 
        if (pageNo !== -1) { 
            this.pageVisitByFrequency.splice(this.pageVisitByFrequency.indexOf(pageNo), 1);
            this.pageVisitByFrequency.push(pageNo);
        }
        //不在内存，调入内存
        else {
            this.setState({ pageFaultNums: this.state.pageFaultNums + 1 });
            if (this.isFull()) {
               // console.log("调页");
                let LRU = this.pageVisitByFrequency[0];//页号
                this.setState({
                    pages: this.state.pages.map((item, idx) =>
                        idx === LRU ?
                            { status: 'replace', entry: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1] }
                            : item)
                })
                this.addToMemory(inst);
            }
            //内存没满，直接push，将访问过的页放在最新
            else {
                let pageNo = this.addToMemory(inst);
                this.pageVisitByFrequency.splice(this.pageVisitByFrequency.indexOf(pageNo), 1);
                this.pageVisitByFrequency.push(pageNo);
            }
        }
        //计算缺页率
        this.state.pageFaultRate = this.state.pageFaultNums / (320 - this.state.instLeft) * 100;
        this.nowInstAt++;
    }
    start = () => {

        if (!this.IntervalID) {
            this.IntervalID = setInterval(this.runByInterval, 100);
            this.runByInterval();
        }
    }

    stop = () => {
        clearInterval(this.IntervalID);
        this.IntervalID = null;
    }

    clear = () => {
        this.setState({
            pageFaultRate: 0,
            currentInstructionNums: 320,
            pageFaultNums: 0,
            pages: this.state.pages = [{
                entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
                status: 'normal'
            }, {
                entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
                status: 'normal'
            }, {
                entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
                status: 'normal'
            }, {
            entry: [-1, -1, -1, -1, - 1, -1, -1, -1, -1, - 1],
                status: 'normal'
            },
            ]
        })
        clearInterval(this.IntervalID);
        this.IntervalID = null;
        this.nowInstAt = 0;
        this.state.instLeft = 320;
    }

    render() {
        return (
            <div style={{ 'display': 'block' }}>
                <div>
                    <h3>请求调页算法 - LRU置换</h3>
                </div>
            <div style={{ 'display':'flex'}}>
                    <div style={{ 'width':'300px'}}>
                    <Card>
                        {/*<CardImg top width="100%" src="" alt="Card image cap" />*/}
                        <CardBody>
                            <CardTitle>States</CardTitle>
                                <CardSubtitle>剩余指令数：</CardSubtitle>
                                <CardText>{this.state.instLeft}</CardText>
                                <CardSubtitle>当前指令：</CardSubtitle>
                                <CardText>{this.state.instructions[this.execOrder[this.nowInstAt]]}</CardText>
                            <CardSubtitle>缺页异常数：</CardSubtitle>
                                <CardText>{this.state.pageFaultNums}</CardText>
                            <CardSubtitle>缺页异常率：</CardSubtitle>
                                <CardText>{this.state.pageFaultRate}%</CardText>
                                <Progress value={this.state.pageFaultRate} />
                        </CardBody>
                    </Card>
                </div>
                <div style={{ 'width': '600px' }}>
                        <Card>
                        {/*<CardImg top width="100%" src="" alt="Card image cap" />*/}
                        <CardBody>
                                <CardTitle>Pages</CardTitle>
                                <CardBody>
                                    {this.state.pages.map((item, idx) => (
                                        <Card style={{ 'padding': '10px' }} className={item.status}>
                                            <CardTitle style={{ 'fontStyle': 'italic' }}>Page {idx}</CardTitle>
                                            <CardText >{item.entry.map(inst => <span style={{ 'padding': '10px',  }}>{inst}</span>)}</CardText>
                                        </Card>)
                                    )
                                    }
                                </CardBody>
                            </CardBody>
                    </Card>
                </div>
                <div style={{ 'width': '250px','height':'600px' }}>
                    <Card>
                            {/*<CardImg top width="100%" src="" alt="Card image cap" />*/}
                            <Button color="primary" onClick={this.start} >Start</Button>
                            <Button color="warning" onClick={this.stop} >Stop</Button>
                            <Button color="danger" onClick={this.clear}>Reset</Button>
                    </Card>
                </div>
                </div>
            </div>
        );
    }
}

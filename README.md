# vue-lucky-card
> 一个vue 组件，用于实现翻卡抽奖、塔罗牌抽奖

### Demo

[Demo Link](https://github.com/u404/vue-lucky-card)


### 使用方法

安装
```
// install
npm install -S vue-lucky-card
```
基本用法
```
<template>
<div>
  <VueLuckyCard :data="cardList">
    <div class="front-side" slot="front" slot-scope="item">Front {{item.data.id}}</div>
    <div class="back-side" slot="back" slot-scope="item">Back {{item.data.id}}</div>
  </VueLuckyCard>
</div>
</template>
<script>
// xxx.vue中
import 'vue-lucky-card/dist/style.css'
import VueLuckyCard from 'vue-lucky-card'


export default {
  components: [
    VueLuckyCard
  ],
  data() {
    return [
      cardList: [
        {
          id: 1
        },
        {
          id: 2
        },
        {
          id: 3
        }
      ]
    ]
  }
}
</script>
<style>
// 自定义卡片容器及正反面的样式
.lucky-card-list {}
.lucky-card {
  width: 300px;
  height: 400px;
  border: 10px solid transparent;
}
.lucky-card-side.front {
  background: #649000;
}
.lucky-card-side.front {
  background: #000649;
}

</style>
```

直接在html中引入：
```
<script src="path/to/vue-lucky-card/dist/style.css"></script>
<script src="path/to/vue-lucky-card/dist/index.js"></script>
```

### 选项

#### data
必须的，一个卡片对象的数组，例如
```
[
  {
    id: 1,
    name: "汽车"
  },
  {
    id: 2,
    name: "手机"
  },
  {
    id: 3,
    name: "谢谢参与"
  }
]
```

#### times
可选的，用户可翻牌的次数，默认为1次

#### onBeforeSelect
可选的，在用户点击某个卡片时，执行一些逻辑（比如调用接口）。这有助于使抽奖行为是可控的。

```
onBeforeSelect: ({ index, selected, list }) {
  // 注意，由于卡片会在动画过程的打乱顺序，所以当前卡片的顺序，会与最初传入的卡片的顺序不同
  // index 用户点击的卡片的索引
  // selected 用户之前选择的卡片的索引的数组，当times > 1时，可能会有一些用途
  // list 当前卡片的数组，这是打乱顺序之后的数组

  // 如果函数return undefined，那么将不会做任何处理

  // 如果函数renturn 一个数字，那么会将这个数字指向的卡片，与用户点击的卡片交换位置，这对用户是不可见的
  // return 1

  // 如果函数return 一个Promise，那么会等待Promise resolve之后才翻开卡片，resolve(数字)，会和上一种情况的处理一样，交换卡片的位置
  // 适合调用接口获取抽奖结果的情况：
  // return axios.post(...).then(res => {
  //   return list.findIndex(o => o.id === res.id)
  // })  
}
```

### 方法
一些执行动画的方法，向外部暴露出来，具体可以通过源码查看

### 事件

支持selected 和 complete 两个事件，参数和上面的钩子函数onBeforeSelect的参数保持一致。与钩子不同的是，不会阻止正常逻辑的执行。


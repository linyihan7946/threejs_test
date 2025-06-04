<!--
 * @Author: LinYiHan
 * @Date: 2023-04-23 13:49:46
 * @Description: 
 * @Version: 1.0
-->
<template>
  <div
    class="home"
    id="home"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThreejsUtils } from "../core/ThreejsUtils";

export default defineComponent({
  name: "Home",
  components: {
    // HelloWorld,
  },
  mounted() {
    console.log("1");
    // 设置组件尺寸为浏览器窗口尺寸
    this.setWindowSize();

    console.log("2");
    // 监听窗口大小变化事件
    window.addEventListener('resize', this.setWindowSize);

    console.log("3");
    const parent: HTMLElement | null = document.getElementById("home");
    if (!parent) {
        alert("找不到home元素");
        return;
    }
    console.log("4");
    const width: number = 1024;
    const height: number = 768;
    const element: HTMLElement = document.createElement("div");
    element.id = "PanoramaView";
    element.style.zIndex = "1000";
    element.style.background = "white";
    element.style.width = width.toString() + "px";
    element.style.height = height.toString() + "px";
    element.style.position = "absolute";
    parent.appendChild(element);
    ThreejsUtils.Instance.open(element);
  },
  methods: {
    setWindowSize() {
      // 获取浏览器窗口的尺寸
      const windowWidth = 1024;// window.innerWidth;
      const windowHeight = 768;// window.innerHeight;

      // 设置组件的宽度和高度
      this.$el.style.width = `${windowWidth}px`;
      this.$el.style.height = `${windowHeight}px`;
    },
  },
});
</script>

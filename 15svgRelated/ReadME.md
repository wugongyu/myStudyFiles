# svg
  [SVG study](https://juejin.cn/post/7124312346947764260?searchId=202403211448073728EF9A87E1E2679D0E#heading-9)
  ## 各类标签
  - 圆形 circle
  - 矩形 rect
  - 椭圆 ellipse
  - 线条 line
  - 折线 polyline
  - 多边形 polygon
  - 路径 path
    path标签是svg标签中最复杂的，但也是功能最强大的，利用它可以画出各类图形。
    
  ## path
    ### 语法
    ```html
    <path d="M50 50 H 200 V 200 H 50 L 50 50" fill="none" style="stroke: #000000;"></path>
    ```

    ### 属性d
      d： 一个点集数列以及其他绘制信息
      属性d的值形式为： 命令 + 参数
      命令：通常以关键字表示

      - 属性d中的命令关键字（直线命令与曲线命令）
        - M: Move to
        - L: Line to
        - H: Horizontal Line to
        - V: Vertical Line to
        - Q: Quadratic Bezier Curve to  （二次贝塞尔曲线）
        - T: Smooth Quadratic Bezier Curve to
        - C: Curve to （曲线）
        - S: Smooth Curve to
        - A: Elliptical Arc（椭圆弧）
        - Z: Close Path 

        以上所有命令关键字中，大写为绝对定位，小写为相对定位


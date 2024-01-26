# typescript

## any unknown never
  1. any
      没有任何类型限制。该类型的变量可以赋予任何类型的值。
      any是所有其他类型的全集，包含了一切可能的类型。

  2. unknown
    unknown表示类型不确定，可以是任意类型

    unknown类型的变量不能直接赋值给其他变量（除了any和unknown类型的以外）。且不能直接调用unknown类型变量的属性和方法。
    unknown类型变量只支持比较运算、取反运算、typeof 、instanceof运算符。
    要使用unknown类型变量进行其他运算，需对其进行【类型缩小】--即缩小unknown变量的类型范围，以确保其不会出错。
  3. never
    never类型，即该类型为空，不包含任何值（空集）。
    其主要用在一些类型运算中，以确保类型运算的完整性。
    另外，不可能有返回值的一些函数，其返回值类型可写为never。
    【注】never类型变量可以赋值给任意其他类型变量。（空集是任意集合的子集）。

    typescript的【顶层类型】：any unknown，
                【底层类型】：never

## string boolean number bigint symbol object undefined null 

  注意区分【包装对象类型】（如String\Number\Boolean\Object等）和【字面量类型】



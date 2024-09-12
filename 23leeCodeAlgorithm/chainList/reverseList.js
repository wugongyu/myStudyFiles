/*
1. 反转一个单链表。

示例:

输入: 1->2->3->4->5->NULL
输出: 5->4->3->2->1->NULL
进阶:
你可以迭代或递归地反转链表。你能否用两种方法解决这道题？

*/ 

function ListNode(val, next) {
  this.val = val===undefined ? 0 : val;
  this.next = !next ?  null : next;
}

// 反转之后的链表，比较简单，就是相当于修改每个节点指针，让它指向上一个。
// 记录一个 next 表示下一个节点， cur 表示当前节点，
// prev 表示上一个节点， 在循环中不断的把 cur.next 赋值为 prev，然后 cur 前进为刚刚保存的 next 节点，直到 cur 为 null。

/**
 * @param {ListNode} head
 * @return {ListNode}
 * */ 
function reverseList(head) {
  if(!head) return null;
  var cur = head, prev = null;
  while(cur) {
    var next = cur.next; // 将cur的指向赋值，防止数据丢失
    cur.next = prev; // 将cur的指针指向上一个节点
    prev = cur; // 将上一个节点往后走一步
    cur = next; // 将当前节点往后走一步，继续反转链表
    // 上面四步的简写
    // [cur.next, prev, cur] = [prev, cur, cur.next]
  }
}





/*
2. 反转从位置 m 到 n 的链表。请使用一趟扫描完成反转。

说明:
1 ≤ m ≤ n ≤ 链表长度。

示例:

输入: 1->2->3->4->5->NULL, m = 2, n = 4
输出: 1->4->3->2->5->NULL
*/ 

/**
 * @param {ListNode} head
 * @param {number} start
 * @param {number} end
 * @return {ListNode}
 * */ 
function reverseBetween(head, start, end) {
  if(!head) return null;
  var vNode = new ListNode(-1, head),
  tempNode = vNode, // 虚拟指针
  count = end - start + 1;
  // 将指针移动到需要反转的第一个节点的前一个节点处
  while(--start) {
    vNode = vNode.next;
  }
  function reverse(head, count) {
    var prev = null,
    cur = head;
    // 区间内进行反转
    while(count --) {
      [cur.next, prev, cur] = [prev, cur, cur.next];
    }
    // 反转前的第一个节点(即反转后的最后一个节点)的指针指向当前节点,用以连接剩下的数据
    head.next = cur;
    return prev; // 返回反转后的第一个节点
  }
  vNode.next = reverse(vNode.next, count); // 前一个节点指针指向反转后的第一个节点
  return tempNode.next; // 返回首节点
}

/*
3. k个一组链表反转
给你链表的头节点 head ，每 k 个节点一组进行翻转，请你返回修改后的链表。
k 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。
你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。

步骤是

1)、先循环，在k个值内反转链表

如果长度不够k个，那么直接返回
如果够k个，就进行反转 
2)、然后循环移动k个，下一组k反转
*/ 

/**
 * @param {ListNode} head
 * @param {number} k
 * @return {ListNode}
 * */ 
function reverseKGroup(head, k) {
  if(!head) return null;
  let vNode = new ListNode(-1, head),
  tempNode = vNode; // 创建虚拟节点
  function reverse(head, k) {
    let prev = head,
      cur = head,
      con = k;
    // 第一次prev节点已经初始赋值为head, 故先遍历k-1次,确定节点数目是否足够k个
    while(--k && prev) {
      prev = prev.next;
    }
    if(!prev) return head; // 节点数不足够k个,不进行反转
    // 反转k个节点
    while(con --) {
      [cur.next, prev, cur] = [prev, cur, cur.next];
    }
    head.next = cur;
    return prev;

  }
  while(vNode) {
    //传节点和k进行反转
    vNode.next = reverse(vNode.next, k);
    //因为k个节点已经处理过；所以vNode往后移动k个
    for (let i = 0; i < k && vNode; i++) {
      vNode = vNode.next;
    }
    // 如果vNode为空,中止循环
    if(!vNode) break;
  }

  return tempNode.next;
}

/*
4. 删除链表的倒数第 N 个结点
给定一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。
删除节点即:将被删除节点的前一个节点的指针指向被删除节点的后一个节点
步骤是:

先创建一个节点a，让它移动n步；
然后创建一个虚拟头节点b，指针指向头节点（将b设置为虚拟头节点是防止删除的节点是头节点）
a和b同时移动，当a为null时，说明b节点在删除节点的前一位
修改b节点的指针指向

快慢指针法。

采用两个间隔为n的指针，同时向前移动。当快指针的下一个节点为最后一个节点时，要删除的节点就是慢指针的下一个节点。


*/ 

/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function(head, n) {
  if(!head) return null;
  //创建一个虚拟头节点
  let ret=new ListNode(-1,head),pre=ret,cur=head;
  //复制的头节点往后移动n步->3
  while(n--){
      cur=cur.next
  }
  //当cur不为空时，虚拟头节点和头节点一起向后移动，当cur为空，说明虚拟头节点在删除节点的前一个
  while(cur){
      pre=pre.next;
      cur=cur.next
  }
  //将虚拟节点的指针指向虚拟节点的下下个
  pre.next=pre.next.next;
  return ret.next
};

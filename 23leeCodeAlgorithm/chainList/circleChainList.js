/*
环形链表
*/ 
function ListNode(val, next) {
  this.value = val;
  this.next = !next ? null : next
}

/*
1. 如何判断是否是循环链表：首先设置一个快指针（走两步），一个慢指针（走一步），两个这个指针相遇时，这个链表就是环形链表，否则就不是
*/ 

/**
 * @param {ListNode} head
 * @return {boolean}
 * */ 
function checkIsCircleChainList(head) {
  if(!head) return false;
  // 设置一个慢指针和快指针，两者相等时，链表中一定存在环
  var slow = head, fast = head;
  while(fast.next && fast.next.next) {
    slow = slow.next; // 慢指针走一步
    fast = fast.next.next; // 快指针走两步
    if(slow === fast) return true;
  }
  return false;
}

/*
2. 返回链表开始入环的第一个节点
如何获取入环的第一个节点呢？就是在快慢指针相等的情况下，头指针和慢指针一起移动，两个指针相遇的节点，就是入环的第一个节点。
*/
/**
 * @param {ListNode} head
 * @return {ListNode}
 * */ 
function circleDetect(head) {
  if(!head) return null;
  var slow = head, fast = head;
  while(fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
    if(slow === fast) {
      // /当快慢指针相等的时候，头节点到入环节点的距离和慢指针到入环节点的距离相等
      var cur = head;
      while(cur !== slow) {
        cur = cur.next;
        slow = slow.next
      }
      return cur;
    }
  }
  return null;
}

/*
设链表共有 a+b 个节点，其中 链表头部到链表入口 有 a 个节点（不计链表入口节点）， 链表环 有 b 个节点（这里需要注意，a 和 b 是未知数）；设两指针分别走了 f，s 步，则有：

fast 走的步数是 slow 步数的 2 倍，即 f=2s；（解析： fast 每轮走 2 步）
fast 比 slow 多走了 n 个环的长度，即 f=s+nb；（ 解析： 双指针都走过 a 步，然后在环内绕圈直到重合，重合时 fast 比 slow 多走 环的长度整数倍 ）。
将以上两式相减得到 f=2nb，s=nb，即 fast 和 slow 指针分别走了 2n，n 个环的周长。

如果让指针从链表头部一直向前走并统计步数k，那么所有 走到链表入口节点时的步数 是：k=a+nb ，即先走 a 步到入口节点，之后每绕 1 圈环（ b 步）都会再次到入口节点。而目前 slow 指针走了 nb 步。因此，我们只要想办法让 slow 再走 a 步停下来，就可以到环的入口。

但是我们不知道 a 的值，该怎么办？依然是使用双指针法。考虑构建一个指针，此指针需要有以下性质：此指针和 slow 一起向前走 a 步后，两者在入口节点重合。那么从哪里走到入口节点需要 a 步？答案是链表头节点head。

作者：Krahets
链接：https://leetcode.cn/problems/linked-list-cycle-ii/solutions/12616/linked-list-cycle-ii-kuai-man-zhi-zhen-shuang-zhi-/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


概括一下：

根据：

1. f=2s （快指针每次2步，路程刚好2倍）

2. f = s + nb (相遇时，刚好多走了n圈）

推出：s = nb

从head结点走到入环点需要走 ： a + nb， 而slow已经走了nb，那么slow再走a步就是入环点了。

如何知道slow刚好走了a步？ 从head开始，和slow指针一起走，相遇时刚好就是a步
*/ 


/*
设链表起点到环入口存在a个节点，环内部存在b个节点

首先分析什么时候能走到环的入口处 走到环入口处，第一次从起点走a个节点，后续就在环里转圈，所以走到环入口处需k = a + nb
假设使用一快一慢两个指针从头遍历，快指针每次走两个节点，慢指针每次走一个节点 相当于快指针每次比慢指针多走一个节点，一个一个的肯定会追上慢指针，最终两者在环内相遇 当相遇时，有如下关系： 1) f = 2s, 即快指针走了慢指针的两倍 2) f = s + nb, 即快指针比慢指针多在环里转了几圈，最终在环内相遇 3）上两式可以得到：s = nb，即慢指针相当于走了环长度的整数倍
结合步骤1得出的式子，可以得到： 此时慢指针已经走了环长度的整数倍，要想走到环入口，则需要再走a个节点的长度 所以此时将快指针指向链表起点处，和慢指针一起每次走一个节点，当两个指针相遇时即为环入口
*/ 
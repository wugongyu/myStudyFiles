
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx';
import XLSX_STYLE from 'xlsx-js-style';

/**
 *     
 * "file-saver": "^2.0.5",
 * "xlsx": "^0.18.5",
 * "xlsx-js-style": "^1.2.0"
 * */ 

/**
 * 将 Element UI 表格元素导出为 Excel 文件
 * @param {HTMLElement} el - 要导出的 Element UI 表格的 DOM 元素
 * @param {string} filename - 导出的 Excel 文件的文件名（不包含扩展名）
 */
export function exportElementTable(el, filename) {
  // 深拷贝表格元素避免污染原始DOM
  const clonedEl = el.cloneNode(true)

  // 移除fixed列容器（避免重复内容）
  const fixedElements = clonedEl.querySelectorAll('.el-table__fixed, .el-table__fixed-right, .el-table__fixed-left')
  if (fixedElements && fixedElements.length > 0) {
    for (let i = 0; i < fixedElements.length; i++) {
      const fixedEl = fixedElements[i]
      if (fixedEl.parentNode) {
        fixedEl.parentNode.removeChild(fixedEl)
      }
    }
  }

  // 获取原始表头和表体的核心table元素
  const headerTable = clonedEl.querySelector('.el-table__header-wrapper table')
  const bodyTable = clonedEl.querySelector('.el-table__body-wrapper table')

  // 创建新表格容器（保留原始table的class和样式）
  const mergedTable = document.createElement('table')
  if (headerTable && headerTable.className) {
    mergedTable.setAttribute('class', headerTable.className)
  }

  // 复制表头结构（关键：保留多级表头的tr层级）
  if (headerTable) {
    const thead = document.createElement('thead')
    const headerRows = headerTable.getElementsByTagName('tr')
    if (headerRows && headerRows.length > 0) {
      for (let i = 0; i < headerRows.length; i++) {
        const tr = headerRows[i]
        thead.appendChild(tr.cloneNode(true))
      }
    }
    mergedTable.appendChild(thead)
  }

  // 复制表体结构（保留数据行）
  if (bodyTable) {
    const tbody = document.createElement('tbody')
    const bodyRows = bodyTable.getElementsByTagName('tr')
    if (bodyRows && bodyRows.length > 0) {
      for (let i = 0; i < bodyRows.length; i++) {
        const tr = bodyRows[i]
        tbody.appendChild(tr.cloneNode(true))
      }
    }
    mergedTable.appendChild(tbody)
  }

  // 关键修复：重新计算并保留合并单元格属性
  const allCells = mergedTable.getElementsByTagName('th')
  const dataCells = mergedTable.getElementsByTagName('td')
  const combinedCells = [].concat(Array.from(allCells), Array.from(dataCells))

  for (let i = 0; i < combinedCells.length; i++) {
    const cell = combinedCells[i]
    if (cell) {
      const rowSpan = cell.getAttribute('data-rowspan') || 1
      const colSpan = cell.getAttribute('data-colspan') || 1
      if (rowSpan > 1) {
        cell.setAttribute('rowspan', rowSpan)
      }
      if (colSpan > 1) {
        cell.setAttribute('colspan', colSpan)
      }
    }
  }

  // 转换配置（关键：启用display模式保留表格结构）
  const ws = XLSX.utils.table_to_book(mergedTable, {
    raw: true,
    display: true, // 启用display模式，正确解析合并单元格和层级
    cellDates: true, // 保留日期格式（可选）
  })

  // 生成并保存文件
  const wbout = XLSX.write(ws, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array',
  })

  saveAs(
    new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${filename}.xlsx`
  )
}


// 表格导出为excel
export class ExportExcelWithCustomStyle{

  constructor(config) {
    // 表头数据字段映射关系
    const defaultKeysMap = {
      labelKey: 'label',
      dataKey: 'prop',
      childrenKey: 'children',
    }
    // 表格数据源字段映射关系
    const defaultDataSourceKeysMap = {
      childrenKey: 'children',
    }
    // 默认的表格单元格样式
    const defaultCellStyle = {
      font: { name: "宋体", sz: 11, color: { auto: 1 } },
      // 单元格对齐方式
      alignment: {
          /// 自动换行
          wrapText: 1,
          // 水平居中
          horizontal: "center",
          // 垂直居中
          vertical: "center"
      }
    }
    const defaultHeaderCellStyle = {
      border: {
        top: { style: 'thin', color: { rgb: "000000" } },
        left: { style: 'thin', color: { rgb: "000000" } },
        bottom: { style: 'thin', color: { rgb: "000000" } },
        right: { style: 'thin', color: { rgb: "000000" } },
      }, // 表头边框
      fill: {
        patternType: 'solid',
        fgColor: { theme: 3, "tint": 0.3999755851924192, rgb: 'ffffff' },
        bgColor: { theme: 7, "tint": 0.3999755851924192, rgb: '8064A2' }
      }, // 表头背景色
    }
    const { columnsKeysMap, dataSourceKeysMap, cellStyle, headerCellStyle } = config || {};
    this.config = config;
    this.columnsKeysMap = columnsKeysMap || defaultKeysMap;
    this.dataSourceKeysMap = dataSourceKeysMap || defaultDataSourceKeysMap;
    this.cellStyle = cellStyle || defaultCellStyle;
    this.headerCellStyle = headerCellStyle || defaultHeaderCellStyle;
  }

  /**
   * excel导出方法
   * @param {*} columns 表头数据，与el-table组件的columns格式一致[{label: '', prop: '', children: []}]
   * @param {*} dataSource el-table的数据源
   * @param {*} filename 导出的excel文件名
   */ 
  export(columns, dataSource, filename) {
    let columnWidth = this.columnWidth(columns);
    let columnHeight = this.columnHeight(columns);
    let headers = []; // 表头数据，二维数组
    // 初始化表头数据
    for (let rowNum = 0; rowNum < columnHeight; rowNum++) {
      headers[rowNum] = [];
      for (let colNum = 0; colNum < columnWidth; colNum++) {
        headers[rowNum][colNum] = '';
      }
    }

    let colOffset = 0; // 表头列偏移量
    let mergeRecord = []; // 表格合并数据
    // 遍历定义的表头数据，进行赋值以及合并数据汇总处理
    for (const item of columns) {
      this.generateExcelColumn(headers, 0, colOffset, item, mergeRecord);
      colOffset += this.treeWidth(item);
    }
    
    // 添加表格数据源
    headers.push(...this.generateBodyData(columns, dataSource));

    // 创建工作表
    let ws = this.aoa_to_sheet(headers, columnHeight);
    // 合并单元格
    ws['!merges'] = mergeRecord;
    // 头部冻结
    ws['!freeze'] = {
      xSplit: "1",
      ySplit: "" + columnHeight,
      topLeftCell: "B" + (columnHeight + 1),
      activePane: 'bottomRight',
      state: "frozen",
    }
    // 列宽
    ws['!cols'] = [{wpx: 165}];
    // 创建工作簿
    const wb = XLSX_STYLE.utils.book_new();
    XLSX_STYLE.utils.book_append_sheet(wb, ws, "sheet1");
    XLSX_STYLE.writeFile(wb, filename + '.xlsx');
  }
  /**
   * 根据表头数据获取表格表头高度(表格表头的行数)
   * @param {*} columns 
   */ 
  columnHeight(columns) {
    let height = 0;
    for (const item of columns) {
      height = Math.max(height, this.treeHeight(item));
    }
    return height;
  }
  /**
   * 根据表头数据获取表格表头宽度（表格表头的列数）
   * @param {*} columns 
   */ 
  columnWidth(columns) {
    let width = 0;
    for (const item of columns) {
      width += this.treeWidth(item);
    }
    return width;
  }
  treeHeight(root) {
    const childrenKey = this.columnsKeysMap.childrenKey;
    if(root) {
      if(root[childrenKey] && root[childrenKey].length !== 0) {
        let maxChildrenLen = 0;
        for (const child of root[childrenKey]) {
          maxChildrenLen = Math.max(maxChildrenLen, this.treeHeight(child));
        }
        return 1 + maxChildrenLen;
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  }
  treeWidth(root) {
    const childrenKey = this.columnsKeysMap.childrenKey
    if(root) {
      if(root[childrenKey] && root[childrenKey].length !== 0) {
        let maxChildrenWidth = 0;
        for (const child of root[childrenKey]) {
          maxChildrenWidth += this.treeWidth(child);
        }
        return maxChildrenWidth;
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  }
  /**
   * 将定义的表头数据columnDefine赋值到初始化的表头数据中columnTable，
   * 此外对于表格合并数据进行汇总
   * @param {Array} columnTable excel表格的表头数据
   * @param {Number} rowOffset 行偏移量
   * @param {Number} colOffset 列偏移量
   * @param {Object} columnDefine 定义的表头数据元素
   * @param {Array} mergeRecord 合并数据
   */ 
  generateExcelColumn(columnTable, rowOffset, colOffset, columnDefine, mergeRecord) {
    const { labelKey, childrenKey } = this.columnsKeysMap;
    let columnWidth = this.treeWidth(columnDefine);
    columnTable[rowOffset][colOffset] = columnDefine[labelKey];
    if(columnDefine[childrenKey]) {
      // 添加列合并数据
      mergeRecord.push({
        s: { r: rowOffset, c: colOffset }, // 合并开始位置
        e: { r: rowOffset, c: colOffset + columnWidth - 1 }, // 合并结束位置
      });
      let tempColOffSet = colOffset;
      for (const child of columnDefine[childrenKey]) {
        this.generateExcelColumn(columnTable, rowOffset + 1, tempColOffSet, child, mergeRecord);
        tempColOffSet += this.treeWidth(child);
      }
    } else {
      // 非表头最后一行，根据初始化columnTable数据，添加行合并数据
      if(rowOffset !== columnTable.length -1) {
        mergeRecord.push({
          s: { r: rowOffset, c: colOffset },
          e: { r: columnTable.length - 1, c: colOffset }
        })
      }
    }
  }
  /**
   * 转换表格数据，根据表头中对应的属性名，将表格数据一一对应上
   * @param {Array} columns 表头配置数据
   * @param {Array} dataSource 表格数据源
   * @returns {Array} 处理过后的与表头列数相对应的表格数据
   */ 
  generateBodyData(columns, dataSource) {
    let dataIndexesAndLabels = []; // 表头中所配置的每列对应dataSource数据的属性名与标签名
    for (const item of columns) {
      dataIndexesAndLabels.push(...this.spreadLeafDataIndexesAndLabels(item))
    }
    return this.recursiveDataSource(dataIndexesAndLabels, dataSource)
  }
  // 展开多级表头中配置的属性名与标签名
  spreadLeafDataIndexesAndLabels(root) {
    let result = [];
    const { childrenKey, dataKey, labelKey } = this.columnsKeysMap;
    if(root[childrenKey]){
      for (const item of root[childrenKey]) {
        result.push(...this.spreadLeafDataIndexesAndLabels(item));
      }
    } else {
      result.push({
        [dataKey]: root[dataKey],
        [labelKey]: root[labelKey]
      });
    }
    return result
  }
  /**
   * 递归处理表格数据源
   * @param {Array} dataIndexesAndLabels 每列对应dataSource数据的属性名与标签名
   * @param {Array} dataSource 表格数据源
   */ 
  recursiveDataSource(dataIndexesAndLabels, dataSource) {
    let result = [];
    const { dataKey, labelKey } = this.columnsKeysMap;
    const { dataSourceItemHandler } = this.config;
    for (const rowData of dataSource) {
      let row = [];
      for (const dataItem of dataIndexesAndLabels) {
        // 注意，可以在此处添加自定义单元格的样式处理，返回的数据为对象格式
        // 形如:{v: [cellValue], s: [cellStyle]}
        const key = dataItem[dataKey];
        const label = dataItem[labelKey];
        const cellData = dataSourceItemHandler && typeof dataSourceItemHandler === 'function' ? dataSourceItemHandler(rowData, key, label) : rowData[key];
        row.push(cellData)
      }
      result.push(row);
      const { childrenKey } = this.dataSourceKeysMap;
      if(rowData[childrenKey]) {
        result.push(...this.recursiveDataSource(columnIndexes, rowData[childrenKey]))
      }
    }
    return result;
  }

  /**
   * 利用插件从数组生成工作表,可自定义单元格样式
   * @param {*} data 工作表数据源,二维数组,包括表头和表格数据
   * @param {*} headerRows 表头行数
   */ 
  aoa_to_sheet(data, headerRows) {
    const ws = {};
    // 工作表范围
    const range = {s: {c: 10000000, r: 10000000}, e: { c: 0, r: 0 }};
    for (let R = 0; R !== data.length; ++R) {
      for (let C = 0; C !== data[R].length; ++C) {
        // 调整工作表范围
        if(range.s.r > R) { range.s.r = R; }
        if(range.s.c > C) { range.s.c = C; }
        if(range.e.r < R) { range.e.r = R; }
        if(range.e.c < C) { range.e.c = C; }
        let cell; // 单元格对象
        if(typeof data[R][C] === 'object' && data[R][C] !== null) {
          // 预留自定义样式
          cell = data[R][C];
        } else {
          cell = {
            v: data[R][C] || '',
            s: {
              ...this.cellStyle,
            }
          }
        }
        if(R < headerRows) {
          cell.s = {
            ...cell.s,
            ...this.headerCellStyle,
          }
        }
        const cell_ref = XLSX_STYLE.utils.encode_cell({r: R, c: C}); // 转换单元格的地址
        
        // 处理单元格的数据类型
        if(typeof cell.v === 'number') {
          cell.t = 'n';
        } else if(typeof cell.v === 'boolean') {
          cell.t = 'b';
        } else {
          cell.t = 's';
        }
        // 将单元格关联的工作簿上
        ws[cell_ref] = cell
      }
    }
    if(range.s.c < 10000000) {
      ws['!ref'] = XLSX_STYLE.utils.encode_range(range); // 转换工作簿范围
    }
    return ws;
  }
}


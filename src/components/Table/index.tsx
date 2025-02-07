import { Table, Empty } from 'antd';
import { useRef } from 'react';


const PTable = (props: any) => {
    // 计算宽度
    //  width = `calc(100vw - 280px)`
    const tableRef = useRef(null);
    const { columns, data, handleTableChange, total, pages, pageOption, border = false, width = '75vw', paginationShow = true, classname, scrollX = '100%', scrollY = '100%' } = props
    const check = () => {
        if (pages === 1) {
            if (total === 1) {
                return `${total} record, ${pages} page`
            }
            return `${total} records, ${pages} page`
        } else {
            return `${total} records, ${pages} pages`
        }
    }
    return (
        <div ref={tableRef}>
            <Table

                rowKey={(record) => record.id}
                bordered={border}
                style={{ height: '100%', width: width }}
                scroll={{ y: scrollY, x: scrollX }}
                // sticky
                className={!paginationShow ? classname : ''}
                columns={columns}
                dataSource={data}
                onChange={(data) => {
                    if (tableRef.current) {
                        tableRef.current?.scrollIntoView?.({ behavior: 'smooth' });
                    }
                    handleTableChange(data)
                }}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                pagination={paginationShow ? {
                    pageSizeOptions: [10, 20, 30, 50], showSizeChanger: true, total: total, showTotal: () => check(), showQuickJumper: true,
                    pageSize: pageOption.pageSize || pageOption.size,
                    current: pageOption.page,
                    locale: {
                        page: 'page',
                        jump_to: 'go to',
                        items_per_page: 'items/page',
                    }
                } : undefined} />
        </div>
    )


}

export default PTable
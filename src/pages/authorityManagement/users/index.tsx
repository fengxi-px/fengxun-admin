import { Ptable } from '@/components';
import { history } from '@umijs/max';
import { Button, Card, Flex, Form, Input, message, Row, Space, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import './index.less';
import { findUser, getUsers, deleteUser } from '@/services/authorityManagement/users/api';
import secondConfirm from '@/utils/secondConfirm';

const pageOptionDefault = { page: 1, pageSize: 10 };

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

const tailLayout = {
    wrapperCol: { offset: 15, span: 16 },
};

let mockData: any = []
for (let i = 0; i < 15; i++) {
    mockData.push(
        {
            key: i,
            id: i,
            user: 'John Brown',
        }
    )
}

let defaultColumns = [
    {
        title: 'User ID',
        width: 200,
        dataIndex: 'id',
        render: (text: any, record: any) => (<span onClick={() => history.push({
            pathname: '/authorityManagement/users/detail',
            search: `?id=${record.id}`,
        })} style={{ color: '#2151d1', cursor: 'pointer' }} >{record.id}</span>)
    },
    {
        title: 'User',
        dataIndex: 'nickname',
        key: 'nickname',
        ellipsis: true,
        width: 200,
    }
]

const Users = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [pageOption, setPageOption] = useState(pageOptionDefault);
    const [columns, setColumns] = useState<Array<{ title: string; dataIndex?: string; key?: string; width?: number; ellipsis?: boolean; render?: (text: any, record: any) => JSX.Element }>>([]);
    const [form] = Form.useForm();

    useEffect(() => {
        getColumns();
        getList();
    }, [])

    let accessActionColumns = [
        {
            title: 'Action',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <span style={{ color: '#2151d1', cursor: 'pointer' }} onClick={() => handleEdit(record)}>Edit</span>
                    <span style={{ color: '#2151d1', cursor: 'pointer' }} onClick={() => handleDelete(record)}>Delete</span>
                </Space>
            ),
        },
    ]
    let viewColumns = [
        {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_: any, record: any) => (
                <Space size="middle">
                    {/* <a>Invite {record.name}</a> */}
                    <span onClick={() => handleEdit(record)} style={{ color: '#2151d1', cursor: 'pointer' }}>View</span>
                </Space>
            ),
        },
    ]
    //模拟有无权限生成columns 
    const getColumns = () => {
        // if (Math.floor(Math.random() * 2) > 0.5) {
        if (true) {
            setColumns([...defaultColumns, ...accessActionColumns]);
            // readOnlyRef.current = false
        } else {
            setColumns([...defaultColumns, ...viewColumns]);
            // readOnlyRef.current = true
        }
    }

    const getList = async (page = 1, size = 10, params = {}) => {
        let data = [];
        if (params) {
            const res = await findUser(params);
            data = res.data;
        } else {
            const res = await getUsers();
            data = res.data;
        }
        if (Array.isArray(data)) {
            let arr: any = []
            data.forEach((item, index) => {
                if (index >= (page - 1) * size && index < page * size) {
                    arr.push(item)
                }
            })
            setData(arr);
            setTotal(data.length);
            setPages(Math.ceil(data.length / pageOption.pageSize));
        } else {
            setData([]);
            setTotal(0);
            setPages(0);
        }
        setPageOption({
            page: page,
            pageSize: size,
        })
    }

    const onFormFinish = async (values: any) => {
        // setPageOption(pageOptionDefault)
        getList(1, 10, values)
    }

    const handleEdit = (record: any) => {
        history.push({
            pathname: '/authorityManagement/users/detail',
            search: `?id=${record.id}`,
        })
    }

    const handleDelete = (record: any) => {
        secondConfirm('Delete', 'Are you sure you want to delete this ?', () => deleteItem(record.id))
    }

    const deleteItem = async (val: any) => {
        try {
            const { msg } = await deleteUser(val)
            if (msg === 'SUCCESS') {
                message.open({
                    type: 'success',
                    content: 'Delete successfully',
                })
            } else {
                message.open({
                    type: 'error',
                    content: 'Delete unsuccessfully',
                })
            }
            const values = form.getFieldsValue();
            getList(pageOption.page, pageOption.pageSize, values)
        } catch (error: any) {
            message.open({
                type: 'error',
                content: error.message,
            })
        }
    }

    const hanleRest = () => {
        form.resetFields();
        setPageOption(pageOptionDefault)
        getList(1, 10, {})
    }


    const handleTableChange = (data: any) => {
        const values = form.getFieldsValue();
        const { pageSize, current } = data;
        getList(current, pageSize, values)
    }

    return (
        <div className="contentContainer">

            <Row>
                <Form
                    onFinish={onFormFinish}
                    layout={'inline'}
                    form={form}
                    className='searchForm'
                >
                    <Flex wrap gap="middle" justify={'space-between'}>
                        <Form.Item label="ID" name="id" >
                            <Input placeholder="" allowClear />
                        </Form.Item>

                        <Form.Item label="User" name="nickname" >
                            <Input placeholder="" allowClear />
                        </Form.Item>

                        <Form.Item >
                            <Button className='searchButton' htmlType="submit">Search</Button>
                            <Button className='resetButton' onClick={hanleRest}>Reset</Button>
                        </Form.Item>
                    </Flex>
                </Form>
            </Row>

            <Row className='tableMarginTop'>
                <Spin spinning={loading}>
                    <Ptable
                        columns={columns}
                        data={data}
                        total={total}
                        pages={pages}
                        pageOption={pageOption}
                        handleTableChange={handleTableChange}
                        scrollX={620}
                        scrollY={'60vh'}
                    />
                </Spin>
            </Row >
        </div>
    )
}
export default Users;
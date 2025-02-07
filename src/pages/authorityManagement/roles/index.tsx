import { Ptable } from '@/components';
import { history } from '@umijs/max';
import { Button, Card, Flex, Form, Input, message, Modal, Row, Space, Spin, Tree, TreeDataNode, TreeProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';
import moment from 'moment';
import { addRole, deleteRole, findRole, getRoles, updateRole } from '@/services/authorityManagement/roles/api';
import secondConfirm from '@/utils/secondConfirm';
import { set } from 'lodash';

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
            role: 'John Brown',
        }
    )
}

const treeData: TreeDataNode[] = [
    {
        title: 'Personal Center',
        key: '1000',
        disabled: true,
    },
    {
        title: 'Users Management',
        key: '0',
        children: [
            { title: 'view', key: '100' },
            { title: 'Edit', key: '10' },
        ],
    },
    {
        title: 'Authority Management',
        key: '1',
    },
];

let roleId = -1;

const Roles = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [pageOption, setPageOption] = useState(pageOptionDefault);
    const [columns, setColumns] = useState<Array<{ title: string; dataIndex?: string; key?: string; width?: number; ellipsis?: boolean; render?: (text: any, record: any) => JSX.Element }>>([]);
    const [form] = Form.useForm();
    const [formModal] = Form.useForm()
    const [operateType, setOperateType] = useState('');
    const [isShow, setIsShow] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(['1000']);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
    const [name, setName] = useState('');

    useEffect(() => {
        getColumns();
        getList();
    }, [])

    let defaultColumns = [
        {
            title: 'User ID',
            width: 100,
            dataIndex: 'id',
            render: (text: any, record: any) => (<span onClick={() => handleEdit(record)} style={{ color: '#2151d1', cursor: 'pointer' }} >{record.id}</span>)
        },
        {
            title: 'Role',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 200,
        }
    ]
    let accessActionColumns = [
        {
            title: 'Action',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_: any, record: any) => (
                <Space size="middle">
                    {/* <a>Invite {record.name}</a> */}
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
            const res = await findRole(params);
            data = res.data;
        } else {
            const res = await getRoles();
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
        getList(1, 10, values)
    }

    const handleEdit = (record: any) => {
        setOperateType('edit');
        setIsShow(true);
        roleId = record.id;
        formModal.setFieldsValue({ name: record.name });
        let permission = [];
        for (let i = 0; i < record.permission.length; i++) {
            {
                if (record.permission[i] === '1') {
                    let str = '';
                    for (let j = 0; j < 3 - i; j++) {
                        str += '0'
                    }
                    permission.push('1' + str)
                    if (permission.includes('100') && permission.includes('10')) {
                        permission.push('0')
                    }
                }
            }
        }
        setCheckedKeys(permission);
    }

    const handleDelete = (record: any) => {
        secondConfirm('Delete', 'Are you sure you want to delete this ?', () => deleteItem(record.id))
    }

    const deleteItem = async (val: any) => {
        try {
            const { msg } = await deleteRole(val)
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

    const handleAdd = () => {
        setIsShow(true);
        setOperateType('add');
    }

    const hanleRest = () => {
        form.resetFields();
        setPageOption(pageOptionDefault)
        getList(1, 10, {})
    }


    const handleTableChange = (pagination: any) => {
        const values = form.getFieldsValue();
        const { pageSize, current } = data;
        getList(current, pageSize, values)
    }

    const onReset = () => {
        setIsShow(false);
        formModal.resetFields();
        roleId = -1;
        setCheckedKeys(['1000']);
        setExpandedKeys([]);
    }

    const onFormFinishForModal = async (values: any) => {
        setLoading(true);
        const { name } = values;
        let permission = 0;
        checkedKeys.forEach(item => {
            permission += Number(item);
        })
        try {
            if (operateType === 'add') {
                // addRole
                const { data } = await addRole({ name, permission: permission.toString() });
                if (typeof data !== 'string') {
                    message.open({
                        type: 'success',
                        content: 'Role added successfully',
                    });
                    onReset();
                    getList();
                } else {
                    message.open({
                        type: 'error',
                        content: 'Failed to add role',
                    });
                }
            } else {
                // updateRole
                const { msg } = await updateRole(roleId, { name, permission: permission.toString() });
                if (msg === 'SUCCESS') {
                    message.open({
                        type: 'success',
                        content: 'Role updated successfully',
                    });
                    onReset();
                    getList();
                }
                else {
                    message.open({
                        type: 'error',
                        content: 'Failed to update role',
                    });
                }
            }
        } catch (error: any) {
            message.open({
                type: 'error',
                content: error.message,
            })
        } finally {
            setLoading(false);
        }
    }

    const onExpand: TreeProps['onExpand'] = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
        setAutoExpandParent(false);
    };

    const onCheck: TreeProps['onCheck'] = (checkedKeysValue) => {
        setCheckedKeys(checkedKeysValue as React.Key[]);
    };

    const onSelect: TreeProps['onSelect'] = (selectedKeysValue, info) => {
        setSelectedKeys(selectedKeysValue);

    };


    return (
        <>
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

                            <Form.Item label="Role" name="name" >
                                <Input placeholder="" allowClear />
                            </Form.Item>

                            <Form.Item >
                                <Button className='searchButton' htmlType="submit">Search</Button>
                                <Button className='resetButton' onClick={hanleRest}>Reset</Button>
                            </Form.Item>
                        </Flex>
                    </Form>
                </Row>

                {true && <Row>
                    <Button className='searchButton' onClick={handleAdd} style={{ marginTop: '15px' }}>Add a new role</Button>
                </Row>}

                <Row style={{ marginTop: '20px' }}>
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
            </div >

            <Modal title="Edit Role" width={650} open={isShow} onCancel={() => onReset()} footer={null} okText="Confirm"
                cancelText="Cancel">
                <Spin spinning={loading}>
                    <Form
                        onFinish={onFormFinishForModal}
                        layout='horizontal'
                        form={formModal}
                        className='searchForm'
                    >
                        <Form.Item label="Role Name" name="name" rules={[{ required: true, message: 'Please input role name' }]}>
                            <Input placeholder="" allowClear style={{ width: '70%' }} />
                        </Form.Item>
                        <Form.Item label="Role Permissions" name="permissions">
                            <Tree
                                style={{ marginTop: '20px' }}
                                checkable
                                onExpand={onExpand}
                                expandedKeys={expandedKeys}
                                autoExpandParent={autoExpandParent}
                                onCheck={onCheck}
                                checkedKeys={checkedKeys}
                                // onSelect={onSelect}
                                selectedKeys={selectedKeys}
                                treeData={treeData}
                            />
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Space>
                                <Button htmlType="button" className='resetButton' onClick={onReset}>
                                    Cancel
                                </Button>
                                <Button type="primary" className='searchButton' htmlType="submit" disabled={loading}>
                                    Save
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Spin>
            </Modal >
        </>
    )
}
export default Roles;
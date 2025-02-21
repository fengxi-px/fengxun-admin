import { Ptable } from '@/components';
import { deleteUserWeb, findUserWeb, getUsersWeb } from '@/services/userManagement/api';
import { disabledDate } from '@/utils/rules';
import secondConfirm from '@/utils/secondConfirm';
import { history } from '@umijs/max';
import { Button, DatePicker, Flex, Form, Input, message, Row, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import './index.less';

const { RangePicker } = DatePicker;
// const { Option } = Select;

const pageOptionDefault = { page: 1, pageSize: 10 };

let mockData: any = [];
for (let i = 0; i < 15; i++) {
  mockData.push({
    key: i,
    id: i,
    name: 'John Brown',
    created_at: '2021-09-01',
    updated_at: '2021-09-01',
  });
}

let defaultColumns = [
  {
    title: 'User ID',
    width: 120,
    dataIndex: 'id',
    render: (text: any, record: any) => (
      <span
        onClick={() =>
          history.push({
            pathname: '/usersManagement/detail',
            search: `?id=${record.id}`,
          })
        }
        style={{ color: '#2151d1', cursor: 'pointer' }}
      >
        {record.id}
      </span>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    ellipsis: true,
    width: 200,
  },
  {
    title: 'Created',
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 150,
  },
  {
    title: 'Updated',
    key: 'updatedAt',
    dataIndex: 'updatedAt',
    width: 150,
  },
];

const UsersManagement = () => {
  const [loading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [pageOption, setPageOption] = useState(pageOptionDefault);
  const [columns, setColumns] = useState<
    Array<{
      title: string;
      dataIndex?: string;
      key?: string;
      width?: number;
      ellipsis?: boolean;
      render?: (text: any, record: any) => JSX.Element;
    }>
  >([]);
  const [form] = Form.useForm();

  let accessActionColumns = [
    {
      title: 'Action',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="middle">
          <span style={{ color: '#2151d1', cursor: 'pointer' }} onClick={() => handleEdit(record)}>
            Edit
          </span>
          <span
            style={{ color: '#2151d1', cursor: 'pointer' }}
            onClick={() => handleDelete(record)}
          >
            Delete
          </span>
        </Space>
      ),
    },
  ];
  let viewColumns = [
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_: any, record: any) => (
        <Space size="middle">
          {/* <a>Invite {record.name}</a> */}
          <span onClick={() => handleEdit(record)} style={{ color: '#2151d1', cursor: 'pointer' }}>
            View
          </span>
        </Space>
      ),
    },
  ];
  //模拟有无权限生成columns
  const getColumns = () => {
    // if (Math.floor(Math.random() * 2) > 0.5) {
    const permission = JSON.parse(localStorage.getItem('permissions') || '[]');
    let flag = false;
    if(permission){
     permission.forEach((item: any) => {
      if(item.path===('/usersManagement')){
        flag = item.canWrite;
      }
     })
    }
    if (flag) {
      setColumns([...defaultColumns, ...accessActionColumns]);
      // readOnlyRef.current = false
    } else {
      setColumns([...defaultColumns, ...viewColumns]);
      // readOnlyRef.current = true
    }
  };

  const getList = async (page = 1, size = 10, params = {}) => {
    let data = [];
    if (params) {
      const requestParams = {
        id: params.id,
        email: params.email,
        startTime:params.created ? String(params.created[0].format('YYYY-MM-DD')) : '',
        endTime:params.created ? String(params.created[1].format('YYYY-MM-DD')) : '',
      }
      const res = await findUserWeb(requestParams);
      data = res.data;
    } else {
      const res = await getUsersWeb();
      data = res.data;
    }
    if (Array.isArray(data)) {
      let arr: any = [];
      data.forEach((item: any) => {
        item.createdAt = dayjs(item.createdAt).format('YYYY-MM-DD');
        item.updatedAt = dayjs(item.updatedAt).format('YYYY-MM-DD');
      });
      data.forEach((item, index) => {
        if (index >= (page - 1) * size && index < page * size) {
          arr.push(item);
        }
      });
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
    });
  };

  useEffect(() => {
    getColumns();
    getList();
  }, []);

  const onFormFinish = async (values: any) => {
    getList(1, 10, values);
  };

  const hanleRest = () => {
    form.resetFields();
    setPageOption(pageOptionDefault);
    getList(1, 10, {});
  };

  const handleEdit = (record: any) => {
    history.push({
      pathname: '/usersManagement/detail',
      search: `?id=${record.id}`,
    });
  };

  const handleDelete = (record: any) => {
    secondConfirm('Delete', 'Are you sure you want to delete this ?', () => deleteItem(record.id));
  };

  const deleteItem = async (val: any) => {
    try {
      const { msg } = await deleteUserWeb(val);
      if (msg === 'SUCCESS') {
        message.open({
          type: 'success',
          content: 'Delete successfully',
        });
      } else {
        message.open({
          type: 'error',
          content: 'Delete unsuccessfully',
        });
      }
      const values = form.getFieldsValue();
      getList(pageOption.page, pageOption.pageSize, values);
    } catch (error: any) {
      message.open({
        type: 'error',
        content: error.message,
      });
    }
  };

  const handleTableChange = (data: any) => {
    const values = form.getFieldsValue();
    const { pageSize, current } = data;
    getList(current, pageSize, values);
  };

  return (
    <div className="contentContainer">
      <Row>
        <Form onFinish={onFormFinish} layout={'inline'} form={form} className="searchForm">
          <Flex wrap gap="middle" justify={'space-between'}>
            <Form.Item label="User ID" name="id">
              <Input placeholder="" allowClear />
            </Form.Item>

            <Form.Item label="email" name="email">
              <Input placeholder="" allowClear />
            </Form.Item>

            <Form.Item label="Created" name="created">
              <RangePicker
                disabledDate={disabledDate}
                format={'YYYY/MM/DD'}
                placeholder={['started', 'ended']}
              />
            </Form.Item>

            <Form.Item>
              <Button className="searchButton" htmlType="submit">
                Search
              </Button>
              <Button className="resetButton" onClick={hanleRest}>
                Reset
              </Button>
            </Form.Item>
          </Flex>
        </Form>
      </Row>

      <Row className="tableMarginTop">
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
      </Row>
    </div>
  );
};

export default UsersManagement;

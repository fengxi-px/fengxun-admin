import { CheckCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Modal } from 'antd';

const { confirm } = Modal;

// loading components from code split
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport

const secondConfirm = (title: any, contet: any, cb: any, oktext = 'Confirm', iconStatus = true) => {
  confirm({
    title: `${title} Confirm`,
    // icon: <ExclamationCircleFilled />,
    icon: iconStatus ? (
      <ExclamationCircleFilled />
    ) : (
      <CheckCircleOutlined style={{ color: 'rgba(42, 159, 71, 1)' }} />
    ),
    okText: oktext,
    cancelText: 'Cancel',
    content: contet,
    okButtonProps: {
      className: 'searchButton',
    },
    cancelButtonProps: {
      className: 'resetButton',
    },
    onOk() {
      console.log('OK');
      cb();
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

export default secondConfirm;

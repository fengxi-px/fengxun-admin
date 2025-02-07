import { Spin } from 'antd';
import { SpaceContext } from 'antd/es/space';
import { LoadingOutlined } from '@ant-design/icons';


// loading components from code split
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport
const contentStyle = {
  padding: 50,
  background: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 4,
};
const content = <div style={contentStyle} />;
const PageLoading = (props: any) => {
  const { tip, loading = false, fullscreen = true } = props
  return (
    // <div style={{ paddingTop: 100, textAlign: 'center' }}>
    <Spin indicator={<LoadingOutlined spin />} size="large" tip={tip} spinning={loading} fullscreen={fullscreen} >
      {content}
    </Spin>
    // </div>
  )
}
export default PageLoading
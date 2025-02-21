
import { Card } from 'antd';

// loading components from code split
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport
import { ReactComponent as Edit } from '@/assets/svg/Edit.svg';
import { ReactComponent as Add } from '@/assets/svg/Add.svg';
import { ReactComponent as Update } from '@/assets/svg/Update.svg';


const PCard = (props: any) => {
    const { children, title, showEdit = false, handleEdit, showAdd = false, handleAdd, showUpdate = false, handleUpdate, updateTtile = 'Update Salesperson' } = props
    return (
        // <Card style={{ marginBottom: '10px' }}>
        <Card style={{width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '20px' }}>{title}</span>
                {
                    showEdit ? (
                        <span className='extraAction' onClick={handleEdit} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', }}> <Edit style={{ marginRight: '5px' }} /> <span style={{ color: 'rgba(0, 82, 217, 1)', fontSize: '14px' }}>Edit</span></span>
                    ) : <></>
                }
                {
                    showAdd && (
                        <span className='extraAction' onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', }}> <Add style={{ marginRight: '5px' }} /><span style={{ color: 'rgba(0, 82, 217, 1)', fontSize: '14px' }}>Add</span></span>
                    )
                }
                {
                    showUpdate && (
                        <span className='extraAction' onClick={handleUpdate} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', }}> <Update style={{ marginRight: '5px' }} /><span style={{ color: 'rgba(0, 82, 217, 1)', fontSize: '14px' }}>{updateTtile}</span></span>
                    )
                }


            </div>
            {children}
        </Card>

    )
}
export default PCard
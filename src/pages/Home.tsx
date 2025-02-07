/* eslint-disable @typescript-eslint/no-use-before-define */
import { getLoginInfo } from '@/utils/userInfo';
import { setLocale } from '@umijs/max';
import { Card } from 'antd';
import React, { useEffect } from 'react';
// import { getLoginInfo } from '@/utils/userInfo';



const Welcome: React.FC = () => {
    const logonInfo = getLoginInfo();
    console.log(logonInfo);


    return (

        <div >
            <Card >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>
                        <span style={{
                            fontSize: '20px',
                            color: '#000',
                            fontWeight: '500',
                            display: 'inline-block',
                            marginRight: ' 50px'
                        }}>Hi，{logonInfo.name}</span>
                        {/* }}>Hi，{logonInfo.name}</span> */}
                    </span>
                    <span>
                        <span style={{ fontWeight: '500' }}>Have a nice day～</span>
                    </span>
                </div>
            </Card>
        </div>

    );
};

export default Welcome;

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { isFunction } from 'lodash-es';
import { useNavigate } from 'react-router-dom';

function TitleWIthBack({ title, back }) {

    const navigate = useNavigate();

    return (
        <div 
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={async () => {
                if(isFunction(back)) {
                    await back();
                }
                navigate(-1);
            }}
        >
            <ArrowLeftOutlined />&nbsp;
            <span>{title}</span>
        </div>
    );
}

export default function PageLayout({ 
    children, 
    back,
    title,
    header,
    ...props 
}) {
    return (
        <PageContainer
            header={{ 
                title: !back ? title : <TitleWIthBack title={title} back={back} />, 
                ...header 
            }}
            {...props}
        >
            <ProCard
                style={{
                    height: '100%',
                    minHeight: 200,
                }}
            >
                {children}
            </ProCard>
        </PageContainer>
    )
}
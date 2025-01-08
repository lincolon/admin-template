import { useState, useEffect, useMemo } from 'react';
import isFunction from 'lodash-es/isFunction';
import debounce from 'lodash-es/debounce';

export default function useSelectSearch({ service, keywords, labelKey, valueKey = 'id', params = {}, auto = true }) {

    const [ options, setOptions ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ opening, setOpening ] = useState(false);

    useEffect(() => {
        if(auto){
            (async () => {
                setLoading(true);
                const { data } = await service({page: 1, page_size: 20, ...params});
                setOptions((data.datas || data.items).map(item => ({
                    label: isFunction(labelKey) ? labelKey(item) : item[labelKey||''], 
                    value: item[valueKey],
                    sourceData: item
                })))
                setLoading(false);
            })();
        }
    }, []);

    const searchHandler = useMemo(() => {
        return debounce(async (val) => {
            console.log(val);
            if(!val)return;
            setLoading(true);
            const { data } = await service({page: 1, page_size: 20, ...params, [keywords]: val});
            setOptions((data.datas || data.items).map(item => ({
                label: isFunction(labelKey) ? labelKey(item) : item[labelKey||''], 
                value: item[valueKey],
                sourceData: item
            })))
            setLoading(false);
        }, 800)
    }, [opening])

    const handleDropdownVisibleChange = async (open) => {
        setOpening(open);
        if(!open)return;
        setLoading(true);
        const { data } = await service({page: 1, pageSize: 20, ...params});
        if(data && data.length > 0) {
            setOptions((data.datas || data.items).map(item => ({
                label: isFunction(labelKey) ? labelKey(item) : item[labelKey||''], 
                value: item[valueKey],
                sourceData: item
            })))
        }
        setLoading(false);
    };

    return [
        options,
        searchHandler,
        loading,
        handleDropdownVisibleChange
    ]
}
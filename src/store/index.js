import { configureStore, createSlice } from '@reduxjs/toolkit'
import storage from 'localforage';

const rootSlice = createSlice({
  name: 'app',
  initialState: {
    data: ''
  },
  reducers: {
    // 这里定义 reducers, 同步函数
    updateDemo(state, action) {
      state.data = action.payload
    }
  },
})

/***
 * 这里可以定义异步函数，在页面其他地方使用 dispatch(updateDemoAsync(params))完成 store 更新
 * 页面上可以使用 import { useDispatch, connect } from 'react-redux';const dispatch = useDispatch();
 *  */ 
export const updateDemoAsync = (params) => {
  return async (dispatch) => {
    /**
     * 这里写异步函数，获取数据，调用 slices 中的 reducers  来保存数据
    */
    dispatch(rootSlice.actions.updateDemo(''));
  }
}

export default configureStore({
  reducer: {
    app: rootSlice.reducer,
  },
})
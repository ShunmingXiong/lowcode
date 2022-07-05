import { defineComponent, inject, reactive, watch } from "vue"
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect } from "element-plus"
import deepcopy from "deepcopy"

export default defineComponent({
    props:{
      block:{type:Object},//用户最后选择的元素
      data:{type:Object},  // 当前所有数据
      updateContainer:{type:Function},
      updateBlock:{type:Function}
    },
    setup(props){
        const config = inject('config')//组建的配置信息
        const state = reactive({
            editData:{}
        })
        const reset = () => {
            if(!props.block){ //说明绑定的是容器的宽度和高度
                state.editData = deepcopy(props.data.container)
            }else{
                state.editData = deepcopy(props.block)

            }
        }
        const apply = () => {
            if(!props.block){
                props.updateContainer({...props.data,container:state.editData})
            }else{//组件
                props.updateBlock(state.editData,props.block)
            }
        }
        watch(()=>props.block,reset,{immediate:true})
        return () => {
            let content = []
            if(!props.block){
                content.push(<>
                    <ElFormItem label="容器宽度">
                        <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                    </ElFormItem>
                    <ElFormItem label="容器高度">
                        <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                    </ElFormItem>
                </>)
            }else{
                let component = config.componentMap[props.block.key]
                if(component && component.props){//{text:{},size:{}}
                    content.push(
                        Object.entries(component.props).map(([propName,propConfig])=>{
                            return <ElFormItem label={propConfig.label}>
                                {{
                                    input:() => <ElInput v-model={state.editData.props[propName]}></ElInput>,
                                    color:() => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
                                    select:() => <ElSelect v-model={state.editData.props[propName]}>
                                        {
                                            propConfig.options.map(opt=>{
                                                return <ElOption label={opt.label} value={opt.value}></ElOption>
                                            })
                                        }
                                    </ElSelect>,
                                }[propConfig.type]()}
                            </ElFormItem>
                        })
                    )
                }
            }

            return <ElForm labelPosition="top" style="padding:30px">
                {content}
                <ElFormItem>
                    <ElButton type="primary" onClick={()=>apply()}>应用</ElButton>
                    <ElButton onClick={reset}>重置</ElButton>
                </ElFormItem>
            </ElForm>
        }   
    }
})
import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
    props:{
        option:{type:Object}
    },
    setup(props,ctx){
        const state = reactive({
            option:props.option,
            isShow:false
        })
        ctx.expose({
            showDialog(option){
                state.option = option
                state.isShow = true
            }
        })
        const onCancel = () => {
            state.isShow = false
        }
        const onConfirm = () => {
            state.isShow = false
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }
        return () => {
            return <ElDialog v-model={state.isShow} title={state.option.title}>
                {{
                    default:() => <ElInput 
                        type='textarea' 
                        v-model={state.option.content}
                        rows={10}    
                    ></ElInput>,
                    footer:() => state.option.footer && <div>
                       <ElButton onClick={onCancel}>取消</ElButton> 
                       <ElButton type='primary' onClick={onConfirm}>确定</ElButton> 
                    </div>
                }}
            </ElDialog>
        }
    }
})

let vm
export function $dialog(option){
    //element-plus是有dialog组件的
    //手动挂载 new SubComponent.$mount
    if(!vm){
        let el = document.createElement("div")
        vm = createVNode(DialogComponent,{option})//将组件渲染成虚拟节点
        document.body.appendChild((render(vm,el),el))//挂载到el上
    }
    

    //将组件渲染到el元素上
    let {showDialog} = vm.component.exposed
    showDialog(option)
}
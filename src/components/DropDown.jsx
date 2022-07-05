import { computed, createVNode, defineComponent, inject, onBeforeUnmount, onMounted, provide, reactive, ref, render } from "vue";

export const DropDownItem = defineComponent({
    props:{
        label:String,
        icon:String
    },
    setup(peops){
        let {label,icon} = peops
        let hide = inject('hide')
        return () => <div className="dropdown-item" onClick={hide}>
            <i className={icon}></i>
            <span>{label}</span>
        </div>
    }
})

const DropDownComponent = defineComponent({
    props:{
        option:{type:Object}
    },
    setup(props,ctx){
        const state = reactive({
            option:props.option,
            isShow:false,
            top:0,
            left:0
        })
        ctx.expose({
           showDropDown(option){
                state.option = option
                state.isShow = true
                let {top,left,height} = option.el.getBoundingClientRect()
                state.top = top + height
                state.left = left
            } 
        })
        provide('hide',()=>{
            state.isShow = false
        })
        const classes = computed(()=>[
            'dropdown',
            {
                'dropdown-isShow':state.isShow
            }
        ])

        const styles = computed(()=>({
            top:state.top+'px',
            left:state.left+'px'
        }))

        const el = ref(null)
        const onMouseDownDocument = (e) => {
            if(!el.value.contains(e.target)){//点击的是内容，什么也不做
                state.isShow = false
            }
        }
        onMounted(()=>{
            //先捕获后冒泡
            document.body.addEventListener('mousedown',onMouseDownDocument,true)
        })

        onBeforeUnmount(()=>{
            document.body.removeEventListener('mousedown',onMouseDownDocument)
        })
        
        return () => {
            return <div class={classes.value} style={styles.value} ref={el}>
                {state.option.content()}
            </div>
        }
    }
})

let vm
export function $dropdown(option){
    //element-plus是有dialog组件的
    //手动挂载 new SubComponent.$mount
    if(!vm){
        let el = document.createElement("div")
        vm = createVNode(DropDownComponent,{option})//将组件渲染成虚拟节点
        document.body.appendChild((render(vm,el),el))//挂载到el上
    }
    

    //将组件渲染到el元素上
    let {showDropDown} = vm.component.exposed
    showDropDown(option)
}
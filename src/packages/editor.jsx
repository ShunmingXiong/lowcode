import { computed, defineComponent, inject, ref } from "vue";
import './editor.scss'
import EditorBlock from './editor-block'
import deepcopy from "deepcopy";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "@/components/Dialog";
export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'], // 要触发的时间
    setup(props, ctx) {
        //预览的时候，内容不能再操作了，可以点击输入内容
        const previewRef = ref(false)
        
        const data = computed({
            get() {
                return props.modelValue 
            },
            set(newValue) {
                ctx.emit('update:modelValue', deepcopy(newValue))
            }
        });
        const containerStyles = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px'
        }))

        const config = inject('config');

        const containerRef = ref(null);
        // 1.实现菜单的拖拽功能
        const { dragstart, dragend } = useMenuDragger(containerRef, data);

        // 2.实现获取焦点 选中后可能直接就进行拖拽了
        let { blockMousedown, focusData, containerMousedown, lastSelectBlock,clearBlockFocus } = useFocus(data, previewRef, (e) => {
            // 获取焦点后进行拖拽
            mousedown(e)
        });
        // 2.实现组件拖拽
        let { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock,data);

        const {commands} = useCommand(data,focusData); // []
        const buttons = [
            {label:'撤销', icon :'icon-back',handler:()=>commands.undo()},
            {label:'重做', icon :'icon-forward',handler:()=>commands.redo()},
            {label:'导出', icon :'icon-export',handler:()=>{
                $dialog({
                    title:'导出json使用',
                    content:JSON.stringify(data.value),
                })
            }},
            {label:'导入', icon :'icon-import',handler:()=>{
                $dialog({
                    title:'导入json使用',
                    content:'',
                    footer:true,
                    onConfirm(text){
                        // data.value = JSON.parse(text)//无法保留历史记录
                        commands.updateContainer(JSON.parse(text))
                    }
                }) 
            }},
            {label:'置顶', icon :'icon-place-top',handler:()=>commands.placeTop()},
            {label:'置底', icon :'icon-place-bottom',handler:()=>commands.placeBottom()},
            {label:'删除', icon :'icon-delete',handler:()=>commands.delete()},
            {label:()=>previewRef.value ? '编辑':'预览', icon :()=>previewRef.value ? 'icon-edit':'icon-browse',handler:()=>{
                previewRef.value = !previewRef.value
                clearBlockFocus()
            }},
        
        ];


       


        return () => <div class="editor">
            <div class="editor-left">
                {/* 根据注册列表 渲染对应的内容  可以实现h5的拖拽*/}
                {config.componentList.map(component => (
                    <div
                        class="editor-left-item"
                        draggable
                        onDragstart={e => dragstart(e, component)}
                        onDragend={dragend}
                    >
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>
                ))}
            </div>
            <div class="editor-top">
                {buttons.map((btn,index)=>{
                    const icon = typeof btn.icon == 'function' ? btn.icon() : btn.icon
                    const label = typeof btn.label == 'function' ? btn.label() : btn.label
                    return <div class="editor-top-button" onClick={btn.handler}>
                        <i class={icon}></i>
                        <span>{label}</span>
                    </div>
                })}
            </div>
            <div class="editor-right">属性控制栏目</div>
            <div class="editor-container">
                {/*  负责产生滚动条 */}
                <div class="editor-container-canvas">
                    {/* 产生内容区域 */}
                    <div
                        class="editor-container-canvas__content"
                        style={containerStyles.value}
                        ref={containerRef}
                        onMousedown={containerMousedown}

                    >
                        {
                            (data.value.blocks.map((block, index) => (
                                <EditorBlock
                                    class={block.focus ? 'editor-block-focus' : ''}
                                    class={previewRef.value ? 'editor-block-preview' : ''}
                                    block={block}
                                    onMousedown={(e) => blockMousedown(e, block, index)}
                                ></EditorBlock>
                            )))
                        }

                        {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
                        {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}

                    </div>

                </div>
            </div>
        </div>
    }
})
import React from "react";
import Item from './Item.js'

export default class Workspace extends React.Component {
    render() {
        const {currentList,
               renameItemCallback,
               moveItemCallback,
               addChangeItemTransactionCallback,
               addMoveItemTransactionCallback} = this.props;
        return (
            <div id="top5-workspace">
                <div id="workspace-edit">
                    <div id="edit-numbering">
                        <div className="item-number">1.</div>
                        <div className="item-number">2.</div>
                        <div className="item-number">3.</div>
                        <div className="item-number">4.</div>
                        <div className="item-number">5.</div>
                    </div>
                </div>
                <div id="edit-items">
                    {
                        currentList != null ? (
                            currentList.items.map(((item, index) => (
                                <Item
                                    key = {currentList.name+"-"+index}
                                    text = {item}
                                    index = {index}
                                    renameItemCallback={renameItemCallback}
                                    moveItemCallback={moveItemCallback}
                                    addChangeItemTransactionCallback={addChangeItemTransactionCallback}
                                    addMoveItemTransactionCallback={addMoveItemTransactionCallback}
                                /> 
                            )))
                        ) : null
                    }
                </div>
            </div>
        )
    }
}
import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button' 
                    className={this.props.undo}
                    onClick={this.props.undoCallback}>
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    className={this.props.redo}
                    onClick={this.props.redoCallback}>
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className={this.props.close}
                    onClick={this.props.closeCallback}>
                        &#x24E7;
                </div>
            </div>
        )
    }
}
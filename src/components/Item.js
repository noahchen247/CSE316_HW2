import React from "react";

export default class Item extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.text,
            editActive: false
        }
    }

    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
    }
    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
        });
    }
    handleUpdate = (event) => {
        this.setState({ text: event.target.value });
    }
    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }
    handleBlur = () => {
        let textValue = this.state.text;
        console.log("Item handleBlur: " + textValue);
        this.props.renameItemCallback( this.props.index, textValue);
        this.handleToggleEdit();
    }

    dragStart = (event) => {
        console.log("picked up " + this.props.index);
        event.dataTransfer.setData("Text", this.props.index);
    }
    dragOver = (event) => {
        //NEED TO MAKE GREEN
        console.log("dragging over element");
        event.preventDefault();
    }
    dragLeave = (event) => {
        //RETURN TO NORMAL
        console.log("leaving drag");
        event.preventDefault();
    }
    drop = (event) => {
        //BULK
        console.log("dropped on " + this.props.index);
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        const { text } = this.props;
        const { index } = this.props.index;
        if (this.state.editActive) {
            return (
                <input 
                    id = {index} 
                    className = "top5-item" 
                    type = "text" 
                    onKeyPress={this.handleKeyPress}
                    onBlur={this.handleBlur}
                    onChange={this.handleUpdate}
                    defaultValue={text}></input>
            )
        }
        else {
            return (
                <div 
                    id = {index} 
                    className = "top5-item"
                    onClick={this.handleClick}
                    draggable="true"
                    onDragStart={this.dragStart}
                    onDragOver={this.dragOver}
                    onDragLeave={this.dragLeave}
                    onDrop={this.drop}> 
                        {text}
                </div>
            )
        }
    }
}
import React from "react";

export default class Item extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: this.props.text,
            editActive: false
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
        let key = this.props.keyNamePair.key;
        let textValue = this.state.text;
        console.log("ListCard handleBlur: " + textValue);
        this.props.renameListCallback(key, textValue);
        this.handleToggleEdit();
    }

    render() {
        const { text } = this.props;
        const { index } = this.props.index;
        return (
            <div id = {index} className = "top5-item">{text}</div>
        )
    }
}
import React, {useState} from 'react'
import './ChatBoxChannel.css'

function ChatBoxChannel(props) {
  const [channel, setChannel] = useState('');

	async function handleChange(event) {
    setChannel(event.target.value);
  }

  function updateChannel() {
    props.updateChannel(channel);
  }

  return (
		<form className="Channel">
			<input class="ChannelTextBox"
				type="text"
				value={channel}
				onChange={handleChange} />
			<input class="ChannelEnterButton"
				type="button"
				value="Enter"
				onClick={updateChannel} />
		</form>
  );
}

export default ChatBoxChannel;

const socket = io();
// Elements
const $messageForm = document.querySelector('form');
const $messageFormInput = $messageForm.querySelector('#txtMessage');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#location_button');
const messagesDiv = document.querySelector('#messages');
const sidebarDiv = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
// Option / Query string
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  // New message element
  const $newMessage = messagesDiv.lastElementChild;
  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = messagesDiv.offsetHeight;

  // Height of messags container
  const containerHeight = messagesDiv.scrollHeight;

  // How far have I scrolled
  const scrollOffset = messagesDiv.scrollTop + visibleHeight;
  if (containerHeight - newMessageHeight <= scrollOffset) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  console.log('======================');
  console.log(newMessageHeight);
};

socket.on('welcomeMessage', message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  });

  ///messagesDiv.HTML('sommething');
  messagesDiv.insertAdjacentHTML('beforeend', html);
  autoscroll();
});
socket.on('roomData', ({ room, users }) => {
  //   console.log('-----------------------');
  //   console.log(room);
  //   console.log(users);
  const html = Mustache.render(sidebarTemplate, { room, users });
  sidebarDiv.insertAdjacentHTML('beforeend', html);
});
socket.on('locationMessage', text => {
  console.log(text);
  const html = Mustache.render(locationTemplate, {
    username: text.username,
    url: text.url,
    createdAt: moment(text.createdAt).format('h:mm a')
  });
  messagesDiv.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  socket.emit('clientMessage', $messageFormInput.value, error => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log('The message was delivered!');
  });
});

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    /* geolocation is available */
    alert('No Geolocation not support');
  }
  $locationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(position => {
    // console.log(position.coords.latitude);
    // console.log(position.coords.longitude);
    socket.emit(
      'sentLocation',
      {
        lat: position.coords.latitude,
        long: position.coords.longitude
      },
      () => {
        $locationButton.removeAttribute('disabled');
        console.log('Location was shared!');
      }
    );
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

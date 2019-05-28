// init socket connection... 
var socket = io.connect("/client_side_device");
socket.on("connect", () => {
    socket.emit("device_data", {})
});
socket.on("newClintConnected", (data) => {
    
})
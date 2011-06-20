function domReady() {
    var stream = new Mad.SocketStream(location.host);
    // var stream = new Mad.AjaxStream('test.mp3');

    setTimeout(function() {
        var player = new Mad.Player(stream);

        player.onProgress = function() {
            console.log("progress");
        };
        
        player.onPlay = function() {
            console.log("play");
        };

        player.onPause = function() {
            console.log("pause");
        };

        player.createDevice();

        player.setPlaying(true);
    }, 5000);
}

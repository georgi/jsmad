Mad.SocketStream = function(url) {
    var self = this;

    this.state = { 'offset': 0, buffer: '', amountRead: 0 };

    this.socket = new io.Socket(url); 
    // socket.on('connect', onConnect);
    this.socket.on('message', function(message) {
        self.updateBuffer(message);
    });
    // socket.on('disconnect', onDisconnect);
    this.socket.connect();
}

Mad.SocketStream.prototype = new Mad.ByteStream();

Mad.SocketStream.prototype.updateBuffer = function(message) {
    this.state['buffer'] += message.buffer;
    this.state['amountRead'] += message.buffer.length;
    return true;
}

Mad.SocketStream.prototype.absoluteAvailable = function(n, updated) {
    return n < this.state['amountRead'];
}

Mad.SocketStream.prototype.seek = function(n) {
    this.state['offset'] += n;
}

Mad.SocketStream.prototype.read = function(n) {
    var result = this.peek(n);
    
    this.seek(n);
    
    return result;
}

Mad.SocketStream.prototype.peek = function(n) {
    if (this.available(n)) {
        var offset = this.state['offset'];
        
        var result = this.get(offset, n);
        
        return result;
    } else {
        throw new Error("buffer underflow with peek!");
        return;
    }
}

Mad.SocketStream.prototype.get = function(offset, length) {
    if (this.absoluteAvailable(offset + length)) {
        return this.state['buffer'].slice(offset, offset + length);
    } else {
        throw new Error("buffer underflow with get!");        
        return;
    }
}

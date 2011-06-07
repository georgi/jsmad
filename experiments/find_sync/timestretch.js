if ( !Function.prototype.bind ) {    
    Function.prototype.bind = function( obj ) {
        var slice = [].slice,
        args = slice.call(arguments, 1), 
        self = this, 
        nop = function () {}, 
        bound = function () {
            return self.apply( this instanceof nop ? this : ( obj || {} ), 
                               args.concat( slice.call(arguments) ) );    
        };
        
        nop.prototype = self.prototype;
        
        bound.prototype = new nop();
        
        return bound;
    };
};

Timestretch = {
    readFile: function () {
        // uploadData is a form element
        // fileChooser is input element of type 'file'
        var file = document.forms['uploadData']['fileChooser'].files[0];
        
        if (!file) {
            return;
        }
        
        new Mad.FileStream(file, this.onLoadFile.bind(this));
    },


    onLoadFile: function (stream) {
        this.mp3 = new Mad.MP3File(stream);
        this.mpeg = this.mp3.getMpegStream();
        
        this.synth = new Mad.Synth();
        this.frame = new Mad.Frame();
        
        this.channelCount = this.frame.header.nchannels();
        this.preBufferSize = 65536 * 1024;
        this.sampleRate = this.frame.header.samplerate;
        this.decodeFrame();
        this.synthFrame();

        this.dev = audioLib.AudioDevice(this.onDeviceLoad.bind(this), 
                                        this.channelCount, 
                                        this.preBufferSize, 
                                        this.sampleRate);
    },

    onDeviceLoad: function(sampleBuffer) {
        var index = 0;
        
        while (index < sampleBuffer.length) {
            for(var i = 0; i < this.channelCount; ++i) {
                sampleBuffer[index++] = this.synth.pcm.samples[i][this.offset];
            }
            
            this.offset += 1;
            
            if (this.offset >= this.synth.pcm.length) {
                this.decodeFrame()
                this.synthFrame();
            }
        }
        
    },

    decodeFrame: function() {
        this.frame = Mad.Frame.decode(this.frame, this.mpeg);
        
        if (this.frame == null) {
            if(this.mpeg.error == Mad.Error.BUFLEN) {
                console.log("End of file!");
            }
            
            console.log("Error code = " + mpeg.error + ", recoverable ? = " + Mad.recoverable(mpeg.error));            
            return;
        }
    },

    synthFrame: function() {
        this.offset = 0;
        this.synth.frameStretch(this.frame, 2);
    },
};


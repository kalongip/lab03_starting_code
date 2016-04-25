// This object represent the waveform generator
var WaveformGenerator = {
    // The generateWaveform function takes 4 parameters:
    //     - type, the type of waveform to be generated
    //     - frequency, the frequency of the waveform to be generated
    //     - amp, the maximum amplitude of the waveform to be generated
    //     - duration, the length (in seconds) of the waveform to be generated
    generateWaveform: function(type, frequency, amp, duration) {
        var nyquistFrequency = sampleRate / 2; // Nyquist frequency
        var totalSamples = Math.floor(sampleRate * duration); // Number of samples to generate
        var result = []; // The temporary array for storing the generated samples

        switch(type) {
            case "sine-time": // Sine wave, time domain
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime));
                }
                break;
            case "square-time": // Square wave, time domain
                var cycle = sampleRate / frequency;
                var half_cycle = cycle / 2;
                for (var i = 0; i < totalSamples; ++i){
                    var position = i % cycle;
                    if (position < half_cycle){
                        result.push(amp * 1.0);
                    }
                    else if (position > half_cycle){
                        result.push(amp * -1.0)
                    }
                }

                break;
            case "square-additive": // Square wave, additive synthesis
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    var sampleValue = 0;
                    // Add the sine waves, until the nyquist frequency is reached
                    for (var wave = 1; wave * frequency < nyquistFrequency; wave += 2) {
                        sampleValue += (1.0 / wave)
                            * Math.sin(2.0 * Math.PI * frequency * wave * currentTime);
                    }
                    result.push(amp * sampleValue);
                }
                break;
            case "sawtooth-time": // Sawtooth wave, time domain
                var half_height = (amp * 1.0 - amp * -1.0) / 2;
                var cycle = sampleRate / frequency;
                var half_cycle = cycle / 2;
                for (var i = 0; i < totalSamples; ++i){
                    var position = i % cycle;
                    var fraction = position / cycle;
                    result.push((half_height * 2) * (1.0 - fraction) - half_height);
                }
                break;
            case "sawtooth-additive": // Sawtooth wave, additive synthesis
                for (var i = 0; i < totalSamples; ++i){
                    var currentTime = i /sampleRate;
                    var sampleValue = 0;
                    for (var wave = 1; wave * frequency < nyquistFrequency; wave += 1){
                        sampleValue += (1.0 / wave)
                            * Math.sin(2.0 * Math.PI * frequency * wave * currentTime);
                    }
                    result.push(amp * sampleValue);
                }
                break;
            case "triangle-additive": // Triangle wave, additive synthesis
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    var sampleValue = 0;
                    // Add the sine waves, until the nyquist frequency is reached
                    for (var wave = 1; wave * frequency < nyquistFrequency; wave += 2) {
                        sampleValue += (1.0 / (wave * wave))
                            * Math.cos(2.0 * Math.PI * frequency * wave * currentTime);
                    }
                    result.push(amp * sampleValue);
                }
                break;
            case "bell-fm": // Bell sound, FM
                for (var i = 0; i < totalSamples; ++i) {
                    var currentTime = i / sampleRate;
                    var modulator = ($("#fm-modulation-amplitude").val()) * Math.sin(2.0 * Math.PI * ($("#fm-modulation-frequency").val()) * currentTime);
                    result.push(amp * Math.sin(2.0 * Math.PI * frequency * currentTime + modulator));
                }
                break;
            case "karplus-strong": // Karplus-Strong algorithm
                var karplus_base = ($("#karplus-base").val());
                if (karplus_base == "256hz-sine"){
                    for (var i = 0; i < totalSamples; ++i) {
                        var currentTime = i / sampleRate;
                        result.push(amp * Math.sin(2.0 * Math.PI * 256 * currentTime));
                    }
                } else{
                    var min = amp * -1.0;
                    var max = amp * 1.0;
                    for (var i = 0; i < totalSamples; ++i){
                        result.push(Math.random() * (max - min) + min)
                    }
                }
                var delay = ($("#karplus-p")).val();
                var blend = ($("#karplus-b")).val();
                for (var i = delay + 1; i < totalSamples; ++i){
                    var t = Math.random();
                    if (t <= blend){
                        result[i] = 0.5 * (result[i - delay] + result[i - delay - 1]);
                    } else{
                        result[i] = -0.5 * (result[i - delay] + result[i - delay - 1]);
                    }
                }
                break;
            case "white-noise": // White noise
                var min = amp * -1.0;
                var max = amp * 1.0;
                for (var i = 0; i < totalSamples; ++i){
                    result.push(Math.random() * (max - min) + min)
                }
                break;
            case "repeating-narrow-pulse": // Repeating narrow pulse
                var cycle = Math.floor(sampleRate / frequency);
                for (var i = 0; i < totalSamples; ++i) {
                    if(i % cycle === 0) {
                        result.push(amp * 1.0);
                    } else if(i % cycle === 1) {
                        result.push(amp * -1.0);
                    } else {
                        result.push(0.0);
                    }
                }
                break;
            default:
                break;
        }

        return result;
    }
};

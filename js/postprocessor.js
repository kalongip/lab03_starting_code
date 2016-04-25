// This object represent the postprocessor
Postprocessor = {
    // The postprocess function takes the audio samples data and the post-processing effect name
    // and the post-processing stage as function parameters. It gathers the required post-processing
    // paramters from the <input> elements, and then applies the post-processing effect to the
    // audio samples data of every channels.
    postprocess: function(channels, effect, pass) {
        switch(effect) {
            case "no-pp":
                // Do nothing
                break;
            case "reverse":
                // Post-process every channels
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;

                    // Apply the post-processing, i.e. reverse
                    audioSequence.data.reverse();

                    // Update the sample data with the post-processed data
                    channels[j].setAudioSequence(audioSequence);
                }
                break;
            case "decay":
                // Obtain all the required parameters
                var decayRate = parseFloat($("#decay-rate").val());
                // Post-process every channels
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;
                    // For every sample, apply a decay multiplier
                    for (var i = 0; i < audioSequence.data.length; i++){
                        var time = i / sampleRate;
                        var mult = Math.exp(-time / decayRate);
                        audioSequence.data[i] = audioSequence.data[i] * mult;
                    }
                    // Update the sample data with the post-processed data
                    channels[j].setAudioSequence(audioSequence);
                }
                break;
            case "fade-in":
                // Obtain all the required parameters
                var fadeInDuration = parseFloat($("#fade-in-duration").data("p" + pass)) * sampleRate;

                // Post-process every channels
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;

                    // Determin how many samples needed to be post-processed
                    var end = Math.min(fadeInDuration, audioSequence.data.length);

                    // For every sample, apply a fade in multiplier
                    for(var i = 0; i < end; ++i) {
                        audioSequence.data[i] *= i / end;
                    }

                    // Update the sample data with the post-processed data
                    channels[j].setAudioSequence(audioSequence);
                }
                break;
            case "fade-out":
                // Obtain all the required parameters
                var fadeOutDuration = parseFloat($("#fade-out-duration").data("p" + pass)) * sampleRate;

                // Post-process every channels
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;

                    // Determin how many samples needed to be post-processed
                    var start =  audioSequence.data.length - fadeOutDuration;

                    // For every sample, apply a fade out multiplier
                    var counter = start;
                    for (var i = audioSequence.data.length; i > start; --i){
                        counter--;
                        audioSequence.data[i] *= 1 - (i - start) /  (audioSequence.data.length - start);
                    }
                    // Update the sample data with the post-processed data
                }
                break;
            case "boost":
                // Find the maximum gain of all channels
                var maxGain = -1.0;
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;
                    var gain = audioSequence.getGain();
                    if(gain > maxGain) {
                        maxGain = gain;
                    }
                }

                // Determin the boost multiplier
                var multiplier = 1.0 / maxGain;

                // Post-process every channels
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;

                    // For every sample, apply a boost multiplier
                    for(var i = 0; i < audioSequence.data.length; ++i) {
                        audioSequence.data[i] *= multiplier;
                    }

                    // Update the sample data with the post-processed data
                    channels[j].setAudioSequence(audioSequence);
                }
                break;
            case "tremolo":
                // Obtain all the required parameters
                var tremoloFrequency = ($("#tremolo-frequency").val());
                var wetness = ($("#tremolo-wetness")).val();

                // Post-process every channels
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;
                    // For every sample, apply a tremolo multiplier
                    for (var i = 0; i < audioSequence.data.length - 1; ++i){
                        var currentTime = i / sampleRate;
                        var mult = Math.sin(2 * Math.PI * tremoloFrequency * currentTime) * 0.5 + 0.5;
                        mult = mult * wetness + (1 - wetness)
                        audioSequence.data[i] *= mult;
                    }
                    // Update the sample data with the post-processed data
                    channels[j].setAudioSequence(audioSequence);
                }
                break;
            case "echo":
                // Obtain all the required parameters
                var delay_line_duration = ($("#echo-delay-line-duration").data("p" + pass));
                var mult = parseFloat($("#echo-multiplier").val());
                var delay_line_length = Math.floor(delay_line_duration * sampleRate);

                // Post-process every channels
                for(var j = 0; j < channels.length; ++j) {
                    // Get the sample data of the channel
                    var audioSequence = channels[j].audioSequenceReference;

                    // Create a new empty delay line
                    var delay_line = [];
                    for (var k = 0; k < delay_line_length; k++){
                        delay_line[k] = 0.0;
                    }
                    var echoed_sample;

                    // Get the sample data of the channel
                    for(var i = 0; i < audioSequence.data.length; ++i) {
                        // Get the echoed sample from the delay line
                        if (i >= delay_line_length){
                            echoed_sample = delay_line[i % delay_line_length];
                        }else{
                            echoed_sample = 0;
                        }

                        // Add the echoed sample to the current sample, with a multiplier
                        audioSequence.data[i] += parseFloat(echoed_sample * mult);
                        // Put the current sample into the delay line
                        delay_line[i % delay_line_length] = audioSequence.data[i];
                    }
                    // Update the sample data with the post-processed data
                    channels[j].setAudioSequence(audioSequence);
                }
                break;
            default:
                // Do nothing
                break;
        }
        return;
    }
}

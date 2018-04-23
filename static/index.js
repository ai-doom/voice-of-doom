import  './libraries/jquery.min.js';
import {Board} from './Arduino.js';
import {Keybaord} from './Keyboard.js';
import {SpeechToText} from './IBM.js'

// uncomment  and changge to import devices
// import {Button} from './Devices.js';
// let button1 = Button();

let board = new Board();
board.connect({baudrate: 9600});

// 
// board.on('line', line => {
//     console.log(`line`, String.fromCharCode(...line))
// });

// only works if device is set: `let board = new Board([button1]);`
board.on('point', point => {
    console.log(`point`, point)
});


let keyboard = new Keybaord();
// uncomment if keyboard wanted
keyboard.on('press', (e) =>{
    if(e.key == ' '){
        record_begin();
    }
});
keyboard.on('release', (e) =>{
    if(e.key == ' '){
        record_end();
    }
});

const microm = new Microm();

async function record_begin(){
    await microm.record();
    console.log('record_begin...');
    setTimeout(()=>{
        swal('Recorder', 'recording...', 'info');
    }, 500)
}

async function record_end(){
    swal('Recorder', 'recorded.', 'success');
    console.log('record_end.');
    await microm.stop();
    let mp3 = await microm.getMp3();
    
    swal('Transtexting...','', 'info');
    let text = null;
    try{
        text = await speech_to_text(mp3.blob);
    }catch(e){
        console.warn(e);
        await swal("Error", "Cannot transcode.", "Error");
    }
    if(text !== null){
        console.log(text)
        await swal('You said:', text, 'success');
    }
}


async function speech_to_text(soundBlob){
    let results = await $.ajax({
        type: 'POST',
        url: '/speech-to-text',
        data: soundBlob,
        processData: false,
        contentType: "multipart/form-data",
    });
    if(results.error){
        throw results.error;
    }
    return results.map(r=> r.alternatives[0].transcript).join(' ');
}

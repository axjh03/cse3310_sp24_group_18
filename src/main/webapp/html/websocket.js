const socket = new WebSocket('ws://localhost:9180');


socket.onopen = function(event) {
    console.log('WebSocket connection established');
};

socket.onmessage = function(event) {
    const sectionToShow = event.data;
    // Use a switch case to determine which section to show
    switch (sectionToShow) {
        case 'section0':
            showSection('section0');
            console.log('section0')
            break;
        case 'section1':
            showSection('section1');
            console.log('section1')
            break;
        case 'section2':
            showSection('section2');
            console.log('section2')
            break;
        case 'section3':
            showSection('section3');
            console.log('section3')
            break;
        default:
            console.log('No such section exists');
            break;
    }
};

socket.onerror = function(error) {
    console.log('WebSocket Error: ', error);
};

socket.onclose = function(event) {
    console.log('WebSocket connection closed', event);
};

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('div').forEach(div => {
        div.classList.add('hidden');
    });

    // Show the specified section
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.remove('hidden');
    }
}
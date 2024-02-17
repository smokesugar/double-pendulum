// Initialize the HTML5 context
canvas = document.querySelector('canvas');
ctx = canvas.getContext('2d');

// Initialize constants

const origin_x = canvas.width/2;
const origin_y = 20;

const l1 = 300;
const l2 = l1;
const m1 = 1;
const m2 = m1;

const g = 2000;

const path_cap = 1000; // How many vertices long can the path be

// Initialize pendulum state
let theta1 = Math.PI * 0.25;
let theta2 = Math.PI * 0.75;
let d_theta1 = 0;
let d_theta2 = 0;

// Draw circle onto canvas
function circle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

// Get current time in seconds
function get_time() {
    return Date.now() / 1000;
}

// Used to clamp delta-time
function clamp(x, min, max) {
    return Math.min(max, Math.max(min, x));
}

// Initialize circular buffer to store path vertices

let path = [];
for (let i = 0; i < path_cap; ++i)
    path.push({x:0, y:0});

let path_head = 0;
let path_tail = path_head;
let path_length = 0;

// Push point into circular path buffer
function path_push(x, y) {
    if (path_length == path_cap) {
        path_head = (path_head + 1) % path_cap;
        path_length--;
    }

    path[path_tail] = {x:x, y:y};
    path_tail = (path_tail + 1) % path_cap;
    path_length++;
}

// Used to compute delta-time
let last_time = get_time();

// Called every frame
function tick() {
    // Compute delta-time
    let now = get_time();
    let dt = clamp(now - last_time, 0, 0.1); // Clamp to avoid time skips when window is not focused
    last_time = now;
    
    // Compute equations of motion (from https://www.myphysicslab.com/pendulum/double-pendulum-en.html)

    theta1 += d_theta1 * dt;
    theta2 += d_theta2 * dt;

    let a_theta1_numer = -g * (2 * m1 + m2) * Math.sin(theta1) - m2 * g * Math.sin(theta1 - 2 * theta2) - 2 * Math.sin(theta1 - theta2) * m2 * (Math.pow(d_theta2, 2) * l2 + Math.pow(d_theta1, 2) * l1 * Math.cos(theta1 - theta2));
    let a_theta1_denom = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));

    let a_theta2_numer = 2 * Math.sin(theta1 - theta2) * (Math.pow(d_theta1, 2) * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(theta1) + Math.pow(d_theta2, 2) * l2 * m2 * Math.cos(theta1 - theta2));
    let a_theta2_denom = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * theta1 - 2 * theta2));

    let a_theta1 = a_theta1_numer / a_theta1_denom;
    let a_theta2 = a_theta2_numer / a_theta2_denom;

    d_theta1 += a_theta1 * dt;
    d_theta2 += a_theta2 * dt;

    let x1 = origin_x + Math.cos(theta1 - Math.PI * 0.5) * l1;
    let y1 = origin_y - Math.sin(theta1 - Math.PI * 0.5) * l1;

    let x2 = x1 + Math.cos(theta2 - Math.PI * 0.5) * l2;
    let y2 = y1 - Math.sin(theta2 - Math.PI * 0.5) * l2;

    // Add point to path
    path_push(x2, y2);

    // Clear background color
    ctx.fillStyle = "#E2E2E2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the path of the pendulum

    ctx.beginPath();

    let i = path_head;
    ctx.moveTo(path[i].x, path[i].y);

    i = (i + 1) % path_cap;

    for (let j = 1; j < path_length; ++j) {
        ctx.lineTo(path[i].x, path[i].y);
        i = (i + 1) % path_cap;
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#C2C2C2";
    ctx.stroke();

    // Draw pendulum members
    ctx.beginPath();
    ctx.moveTo(origin_x, origin_y);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#5F5F5F";
    ctx.stroke();

    // Draw pendulum vertex circles
    circle(origin_x, origin_y, 10, "black");
    circle(x1, y1, 10, "black");
    circle(x2, y2, 10, "black");

    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
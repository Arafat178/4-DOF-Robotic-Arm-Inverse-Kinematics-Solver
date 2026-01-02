// --- MODAL LOGIC ---
const modal = document.getElementById("theoryModal");
const btn = document.getElementById("btnTheory");
const span = document.getElementsByClassName("close-btn")[0];

if (btn) {
    btn.onclick = function() { modal.style.display = "block"; }
}
if (span) {
    span.onclick = function() { modal.style.display = "none"; }
}
window.onclick = function(event) {
    if (event.target == modal) { modal.style.display = "none"; }
}

// --- IK SOLVER LOGIC ---
const inputs = document.querySelectorAll('input');
inputs.forEach(input => input.addEventListener('input', calculateAndDraw));

const cvsTop = document.getElementById('topView');
const ctxTop = cvsTop.getContext('2d');
const cvsSide = document.getElementById('sideView');
const ctxSide = cvsSide.getContext('2d');

calculateAndDraw();

function calculateAndDraw() {
    // Read Values
    let L1 = parseFloat(document.getElementById('l1').value);
    let L2 = parseFloat(document.getElementById('l2').value);
    let L3 = parseFloat(document.getElementById('l3').value);
    let L4 = parseFloat(document.getElementById('l4').value);

    let px = parseFloat(document.getElementById('tx').value);
    let py = parseFloat(document.getElementById('ty').value);
    let pz = parseFloat(document.getElementById('tz').value);
    let alphaDeg = parseFloat(document.getElementById('alpha').value);
    let alphaRad = alphaDeg * (Math.PI / 180);

    // --- MATH (আপনার লজিক অপরিবর্তিত রাখা হয়েছে) ---
    
    // 1. Base (Theta 1)
    let th1 = Math.atan2(py, px);

    // 2. Wrist Center
    let r_target = Math.sqrt(px*px + py*py);
    let w_r = r_target - L4 * Math.sin(alphaRad);
    let w_z = (pz - L1) + L4 * Math.cos(alphaRad); // Note: আপনার লজিক অনুযায়ী (+)

    // 3. Triangle Check
    let d = Math.sqrt(w_r*w_r + w_z*w_z);

    if (d > (L2 + L3) || isNaN(d)) {
        document.getElementById('errorMsg').style.display = 'block';
        return; 
    } else {
        document.getElementById('errorMsg').style.display = 'none';
    }

    // 4. Elbow (Theta 3) - (angle between L2 & L3)
    let cos_angle_elbow = (L2*L2 + L3*L3 - d*d) / (2 * L2 * L3);
    cos_angle_elbow = Math.max(-1, Math.min(1, cos_angle_elbow));
    let internal_elbow = Math.acos(cos_angle_elbow);
    let th3 = internal_elbow; 

    // 5. Shoulder (Theta 2) - (angle between L1 & L2)
    let angle_d = Math.atan2(w_z, w_r);
    let cos_angle_shoulder = (L2*L2 + d*d - L3*L3) / (2 * L2 * d);
    cos_angle_shoulder = Math.max(-1, Math.min(1, cos_angle_shoulder));
    let angle_offset = Math.acos(cos_angle_shoulder);
    let th2 = angle_d + angle_offset + (Math.PI/2);

    // 6. Wrist (Theta 4) - (angle between L3 & L4)
    let th4 = Math.atan2(w_r,w_z) + Math.acos((L3*L3 + d*d - L2*L2)/(2*L3*d)) + alphaRad;


    // --- UI UPDATE ---
    // convert radian to degree 
    document.getElementById('th1').innerText = (th1 * 180/Math.PI).toFixed(1);
    document.getElementById('th2').innerText = (th2 * 180/Math.PI).toFixed(1);
    document.getElementById('th3').innerText = (th3 * 180/Math.PI).toFixed(1);
    document.getElementById('th4').innerText = (th4 * 180/Math.PI).toFixed(1);


    // --- DRAWING ---
    drawTopView(ctxTop, px, py, r_target);
    drawSideView(ctxSide, L1, L2, L3, L4, th2, th3, alphaRad,px,py,pz);
}

function drawTopView(ctx, tx, ty, r_total) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    let cx = w / 2;
    let cy = h / 2;
    let scale = 0.5; 

    ctx.save();
    ctx.translate(cx, cy);
    
    // Grid
    ctx.strokeStyle = "#eee";
    ctx.beginPath();
    ctx.moveTo(-w/2, 0); ctx.lineTo(w/2, 0);
    ctx.moveTo(0, -h/2); ctx.lineTo(0, h/2);
    ctx.stroke();

    // Base
    ctx.beginPath(); ctx.arc(0,0, 5, 0, Math.PI*2);
    ctx.fillStyle = '#333'; ctx.fill();

    // Arm Line
    ctx.beginPath(); ctx.moveTo(0,0);
    ctx.lineTo(tx * scale, -ty * scale);
    ctx.strokeStyle = '#007bff'; ctx.lineWidth = 3; ctx.stroke();

    // Target Dot
    ctx.beginPath(); ctx.arc(tx * scale, -ty * scale, 3, 0, Math.PI*2);
    ctx.fillStyle = 'red'; ctx.fill();

    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText("TOP VIEW", -cx + 5, -cy + 15);

    // --- TEXT LABEL (User Input) ---
    ctx.fillStyle = "blue";
    ctx.font = "bold 12px Arial";
    // text position
    ctx.fillText(`(${tx}, ${ty})`, (tx * scale) - 55, (-ty * scale));

    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText("TOP VIEW", -cx + 5, -cy + 15);
    ctx.restore();
}

// --- FIX: UPDATED DRAW SIDE VIEW ---
function drawSideView(ctx, l1, l2, l3, l4, user_th2, user_th3, alphaRad,px,py,pz) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    ctx.clearRect(0, 0, w, h);

    let ox = 30; 
    let oy = h - 30;
    let scale = 0.5; 

    ctx.save();
    ctx.translate(ox, oy);
    
    // Floor
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(w, 0);
    ctx.strokeStyle = '#aaa'; ctx.stroke();

    // Flip Y-axis to make Math calculations easier (Up is +Y)
    ctx.scale(1, -1);

    // --- FORWARD KINEMATICS FOR DRAWING ---
    // calculate global angle with horizon
    
    // 1. Joint 1 (Top of Base)
    let j1x = 0;
    let j1y = l1 * scale;

    // 2. Joint 2 (Shoulder)।
    // global theta2: (th2 - 90 deg)
    let global_angle_L2 = user_th2 - (Math.PI / 2);
    
    let j2x = j1x + (l2 * scale) * Math.cos(global_angle_L2);
    let j2y = j1y + (l2 * scale) * Math.sin(global_angle_L2);
    
    // 3. Joint 3 (Elbow)
    //global_angle_L2 - (PI - th3)
    let global_angle_L3 = global_angle_L2 - (Math.PI - user_th3);

    let j3x = j2x + (l3 * scale) * Math.cos(global_angle_L3);
    let j3y = j2y + (l3 * scale) * Math.sin(global_angle_L3);

    // 4. Joint 4 (Wrist / End Effector)
    let global_angle_L4 = 3*(Math.PI / 2) + alphaRad;

    let j4x = j3x + (l4 * scale) * Math.cos(global_angle_L4);
    let j4y = j3y + (l4 * scale) * Math.sin(global_angle_L4);


    // --- DRAW LINES ---
    ctx.lineWidth = 4; 
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // L1 (Base Vertical)
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(j1x, j1y);
    ctx.strokeStyle = '#333'; ctx.stroke();
    
    // L2 (Arm)
    ctx.beginPath(); ctx.moveTo(j1x, j1y); ctx.lineTo(j2x, j2y);
    ctx.strokeStyle = '#007bff'; ctx.stroke();
    
    // L3 (Forearm)
    ctx.beginPath(); ctx.moveTo(j2x, j2y); ctx.lineTo(j3x, j3y);
    ctx.strokeStyle = '#28a745'; ctx.stroke();
    
    // L4 (Hand)
    ctx.beginPath(); ctx.moveTo(j3x, j3y); ctx.lineTo(j4x, j4y);
    ctx.strokeStyle = '#dc3545'; ctx.stroke();

    // --- DRAW JOINTS (Dots) ---
    ctx.fillStyle = 'white'; ctx.strokeStyle = 'black'; ctx.lineWidth = 1;
    [[0,0], [j1x,j1y], [j2x,j2y], [j3x,j3y]].forEach(p => {
        ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
    });

    // --- TEXT LABEL (User Input) ---
    // reverse direction with y axis
    ctx.scale(1, -1); 
    
    ctx.fillStyle = "blue";
    ctx.font = "bold 12px Arial";
    if(!isNaN(px)) {
        ctx.fillText(`(${px}, ${py}, ${pz})`, j4x + 5, -j4y);
    }

    ctx.restore();
    
    // Label
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText("SIDE VIEW", 5, 15);


}
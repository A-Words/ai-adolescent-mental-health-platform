/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/38632/AppData/Local/npm-cache/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, onUnmounted, toRefs, watch } from 'vue';
const props = defineProps();
const { isPeeking, isBackTurned, isError } = toRefs(props);
const containerRef = ref(null);
const canvasRef = ref(null);
let ctx = null;
let animationId = 0;
// Mouse position
let mouseX = 0;
let mouseY = 0;
// Animation state
let purpleBend = 0; // 0 to 1
let turnAngle = 0; // 0 to 1 (1 = 180 degrees turned)
let errorProgress = 0; // 0 to 1 for the arc animation
let isAnimatingError = false;
let randomPeekerId = ref(null);
let peekTimer = null;
// Watch for back turned to start random peeking
watch(isBackTurned, (val) => {
    if (val) {
        startRandomPeek();
    }
    else {
        stopRandomPeek();
    }
});
const startRandomPeek = () => {
    const scheduleNext = () => {
        const delay = 2000 + Math.random() * 2000; // 2-4 seconds (changed from 1-3)
        peekTimer = setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * characters.length);
            const selectedChar = characters[randomIndex];
            if (selectedChar) {
                randomPeekerId.value = selectedChar.id;
            }
            // Peek for 600ms
            setTimeout(() => {
                randomPeekerId.value = null;
                if (isBackTurned.value)
                    scheduleNext();
            }, 600);
        }, delay);
    };
    scheduleNext();
};
const stopRandomPeek = () => {
    if (peekTimer)
        clearTimeout(peekTimer);
    randomPeekerId.value = null;
};
// Constants
const BASE_Y = 450; // Floor level
const FACE_ROTATION_RADIUS = 15;
// Characters Config
const characters = [
    // 1. Purple (Back Left)
    {
        id: 'purple',
        type: 'bent-rect',
        color: '#6c5ce7',
        x: 150, // Center X
        y: BASE_Y,
        width: 140,
        height: 300,
        zIndex: 1,
        eyes: [{ x: -30, y: -260, size: 12 }, { x: 30, y: -260, size: 12 }],
        mouth: { y: -230, type: 'small' },
        nextBlink: 500 + Math.random() * 600, // 2-4s (60fps * 2 to 4)
        blinkCounter: 0,
        isBlinking: false
    },
    // 2. Black (Back Right)
    {
        id: 'black',
        type: 'rect', // Will be deformable
        color: '#2d3436',
        x: 300,
        y: BASE_Y,
        width: 100,
        height: 180,
        zIndex: 2,
        eyes: [{ x: -20, y: -140, size: 15 }, { x: 20, y: -140, size: 15 }],
        mouth: { y: -110, type: 'smile' },
        nextBlink: 500 + Math.random() * 600,
        blinkCounter: 0,
        isBlinking: false
    },
    // 3. Orange (Front Left)
    {
        id: 'orange',
        type: 'semicircle',
        color: '#e17055',
        x: 180,
        y: BASE_Y,
        radius: 110,
        zIndex: 3,
        eyes: [{ x: -40, y: -60, size: 8 }, { x: 40, y: -60, size: 8 }],
        mouth: { y: -30, type: 'smile' },
        nextBlink: 500 + Math.random() * 500,
        blinkCounter: 0,
        isBlinking: false
    },
    // 4. Yellow (Front Right)
    {
        id: 'yellow',
        type: 'rounded',
        color: '#fdcb6e',
        x: 400,
        y: BASE_Y,
        width: 120,
        height: 160,
        zIndex: 4,
        eyes: [{ x: -25, y: -110, size: 10 }, { x: 25, y: -110, size: 10 }],
        mouth: { y: -80, type: 'beak' }, // Beak line
        nextBlink: 500 + Math.random() * 600,
        blinkCounter: 0,
        isBlinking: false
    }
];
const handleResize = () => {
    if (containerRef.value && canvasRef.value) {
        const { width, height } = containerRef.value.getBoundingClientRect();
        canvasRef.value.width = width;
        canvasRef.value.height = height;
    }
};
const handleMouseMove = (e) => {
    if (canvasRef.value) {
        const rect = canvasRef.value.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
};
// Watch for error trigger
watch(isError, (val) => {
    if (val) {
        isAnimatingError = true;
        errorProgress = 0;
    }
});
const animate = () => {
    if (!ctx || !canvasRef.value)
        return;
    const width = canvasRef.value.width;
    const height = canvasRef.value.height;
    ctx.clearRect(0, 0, width, height);
    // Update Animation States
    // 1. Purple Bend (Peeking) - Applies to others too now
    const targetBend = isPeeking.value && !isBackTurned.value ? 1 : 0;
    purpleBend += (targetBend - purpleBend) * 0.1;
    // 2. Turn (Privacy)
    const targetTurn = isBackTurned.value ? 1 : 0;
    turnAngle += (targetTurn - turnAngle) * 0.1;
    // 3. Blinking (Independent per character or global random?)
    // User wants "random 2-4s interval" for the group or each? 
    // "These 4 characters blinking frequency should be random 2-4s".
    // This implies independent blinking or a global blink that happens randomly.
    // Let's make it independent for better effect.
    // We need blink timers for each character.
    // Add blink state to characters array?
    // Or just randomize global blink timer.
    // If global: All blink together. User said "Too unified/uniform is not good".
    // So we need independent blinking.
    // We should initialize blink timers in characters object.
    // Update blink logic in loop
    // 4. Mouse Bend for Orange
    // Calculate relative mouse X to orange char (index 2)
    const scale = Math.min(width / 600, height / 600) * 0.9;
    const orangeGlobalX = (width / 2 - 300 * scale) + 180 * scale;
    const orangeRadius = 110 * scale;
    // Threshold: 3/4 of body width from left. 
    // Left is orangeGlobalX - orangeRadius. 
    // Width is 2 * orangeRadius.
    // 3/4 Width is 1.5 * orangeRadius.
    // Threshold Right = (orangeGlobalX - orangeRadius) + 1.5 * orangeRadius = orangeGlobalX + 0.5 * orangeRadius
    // Threshold Left = (orangeGlobalX - orangeRadius) + 0.5 * orangeRadius = orangeGlobalX - 0.5 * orangeRadius
    const thresholdRight = orangeGlobalX + 0.5 * orangeRadius;
    const thresholdLeft = orangeGlobalX - 0.5 * orangeRadius;
    let mouseBend = 0;
    if (mouseX > thresholdRight) {
        // Linearly increase bend as mouse moves right
        const excess = mouseX - thresholdRight;
        mouseBend = excess / (150 * scale);
    }
    else if (mouseX < thresholdLeft) {
        // Linearly decrease bend (negative) as mouse moves left
        const excess = mouseX - thresholdLeft;
        mouseBend = excess / (150 * scale);
    }
    if (mouseBend > 1)
        mouseBend = 1;
    if (mouseBend < -1)
        mouseBend = -1;
    // 5. Error Animation (Circular Arc: Left -> Down -> Right -> Down -> Left)
    let faceOffsetX = 0;
    let faceOffsetY = 0;
    // Removed body rotation
    if (isAnimatingError) {
        errorProgress += 0.03; // Slower speed
        // Total cycle: 0 to 2PI (1 loop)
        if (errorProgress >= Math.PI * 2) {
            isAnimatingError = false;
            errorProgress = 0;
        }
        // Circular motion on bottom half
        // Angle oscillates PI (Left) -> 0 (Right) -> PI (Left)
        const cycle = errorProgress % (Math.PI * 2);
        let angle = 0;
        if (cycle < Math.PI) {
            // Left (PI) -> Right (0)
            angle = Math.PI - cycle;
        }
        else {
            // Right (0) -> Left (PI)
            angle = cycle - Math.PI;
        }
        faceOffsetX = Math.cos(angle) * FACE_ROTATION_RADIUS;
        faceOffsetY = Math.sin(angle) * FACE_ROTATION_RADIUS;
    }
    // Draw Scene
    ctx.save();
    ctx.translate(width / 2 - (300 * scale), height / 2 - (250 * scale));
    ctx.scale(scale, scale);
    // 3. Independent Blinking Logic
    // Sort first to use in drawing, but update state on sorted or original?
    // State is on objects in array, so updating sorted items updates original refs.
    const sortedChars = [...characters].sort((a, b) => a.zIndex - b.zIndex);
    sortedChars.forEach(char => {
        // @ts-ignore
        char.blinkCounter++;
        // @ts-ignore
        if (char.blinkCounter > char.nextBlink) {
            // @ts-ignore
            char.isBlinking = true;
            // @ts-ignore
            if (char.blinkCounter > char.nextBlink + 15) { // Blink duration 15 frames
                // @ts-ignore
                char.blinkCounter = 0;
                // @ts-ignore
                char.isBlinking = false;
                // @ts-ignore
                char.nextBlink = 500 + Math.random() * 500; // Reset 2-4s
            }
        }
    });
    sortedChars.forEach(char => {
        ctx?.save();
        // Apply Character Transforms
        const baseX = char.x;
        const baseY = char.y;
        ctx?.translate(baseX, baseY);
        // Turning Logic
        const isThisCharPeeking = randomPeekerId.value === char.id;
        // Base Flip Scale
        let currentTurn = turnAngle;
        let flipScale = 1 - 2 * currentTurn; // 1 -> -1
        if (isThisCharPeeking && isBackTurned.value) {
            flipScale = 1;
        }
        // Rotation for peeking (Leaning)
        // REMOVED as per request "Don't tilt body".
        // Instead, use bent shape logic for Rect/Rounded.
        ctx?.scale(flipScale, 1);
        // Error Rotation REMOVED
        // Draw Body
        ctx.fillStyle = char.color;
        ctx?.beginPath();
        // Determine bend factor for peeking
        let peekBend = purpleBend; // Default mouse follow
        if (isThisCharPeeking) {
            // If peeking, bend towards center (300)
            // BUT user says "Black and Orange look left but should lean right".
            // The password field is on the RIGHT.
            // So everyone should lean RIGHT (positive bend) to see the password.
            // Previously: (char.x < 300 ? 1 : -1) * 1.5
            // If char > 300 (Black=300, Yellow=400), it was negative (Left).
            // Let's force lean RIGHT for everyone.
            peekBend = 1.5; // Always lean right
        }
        if (char.id === 'purple') {
            // Purple: Bent Rect (Straight lines)
            drawBentRect(ctx, -char.width / 2, -char.height, char.width, char.height, peekBend);
        }
        else if (char.id === 'black') {
            // Black: Stretch + Bent Rect
            const stretchH = char.height * (1 + Math.abs(peekBend) * 0.1);
            drawBentRect(ctx, -char.width / 2, -stretchH, char.width, stretchH, peekBend);
        }
        else if (char.id === 'yellow') {
            // Yellow: Stretch + Bent Rounded
            const stretchH = char.height * (1 + Math.abs(peekBend) * 0.1);
            drawBentRoundedRect(ctx, -char.width / 2, -stretchH, char.width, stretchH, char.width / 2, peekBend);
        }
        else if (char.id === 'orange') {
            // Orange: Semicircle. NO TILT. Just look right.
            // User said "Black and Orange... should lean right".
            // So pass peekBend (1.5) to deformed semicircle to make it "lean".
            // drawDeformedSemicircle uses bend to lower/raise shoulders.
            // If bend > 0, Left shoulder lowers, Right shoulder raises.
            // This visually looks like stretching towards the Right?
            // Let's try passing peekBend.
            drawDeformedSemicircle(ctx, char.radius, isThisCharPeeking ? peekBend : mouseBend);
        }
        ctx?.fill();
        // Draw Face Logic (Updated)
        const showFace = turnAngle < 0.5 || isThisCharPeeking;
        if (showFace) {
            // ... existing face logic ...
            // Face Offset need to match body bend
            let bendFaceX = 0;
            let bendFaceY = 0;
            if (isPeeking.value || isThisCharPeeking) { // Applies to both mouse peek and random peek
                const activeBend = isThisCharPeeking ? peekBend : purpleBend;
                if (char.id === 'purple' || char.id === 'black' || char.id === 'yellow') {
                    bendFaceX = activeBend * 30;
                    if (char.id !== 'purple')
                        bendFaceY = -10;
                }
                // Orange: No face movement from bend
            }
            ctx?.save();
            ctx?.translate(faceOffsetX + bendFaceX, faceOffsetY + bendFaceY);
            // Look At Angle
            const globalCharX = (width / 2 - 300 * scale) + baseX * scale;
            let charHeight = char.height || char.radius || 0;
            if ((char.id === 'black' || char.id === 'yellow') && (isPeeking.value || isThisCharPeeking))
                charHeight *= 1.1;
            const globalCharY = (height / 2 - 250 * scale) + (baseY - charHeight / 2) * scale;
            // Target: Mouse OR Center (if random peek)
            let targetX = mouseX;
            let targetY = mouseY;
            if (isThisCharPeeking) {
                // Look at center input area (approx width * 2, height/2 + 50)
                // Form is on the right side.
                targetX = width * 2;
                targetY = height / 2 + 50 * scale;
            }
            const dx = targetX - globalCharX;
            const dy = targetY - globalCharY;
            const lookAngle = Math.atan2(dy, dx);
            // Draw Eyes
            char.eyes.forEach(eye => {
                let eyeState = 'normal';
                if (isError.value)
                    eyeState = 'scared';
                if (isPeeking.value) {
                    // ... existing ...
                    if (char.id === 'purple')
                        eyeState = 'surprised';
                    if (char.id === 'orange')
                        eyeState = 'surprised';
                    if (char.id === 'black' || char.id === 'yellow')
                        eyeState = 'squint';
                }
                if (isThisCharPeeking) {
                    eyeState = 'squint'; // Sneaky look
                }
                // Use individual blink state
                // @ts-ignore
                if (char.isBlinking && eyeState !== 'squint' && eyeState !== 'scared')
                    eyeState = 'blink';
                drawEye(ctx, eye.x, eye.y, eye.size, lookAngle, eyeState);
            });
            // Draw Mouth
            let mouthType = char.mouth.type;
            if (isPeeking.value && char.id === 'orange')
                mouthType = 'surprised';
            if (isThisCharPeeking)
                mouthType = 'smile'; // Sneaky smile
            drawMouth(ctx, char.mouth.y, mouthType, isError.value, (isPeeking.value && (char.id === 'purple' || char.id === 'orange')));
            ctx?.restore();
        }
        ctx?.restore();
    });
    ctx.restore();
    animationId = requestAnimationFrame(animate);
};
// Helpers
const drawBentRect = (ctx, x, y, w, h, bend) => {
    // Straight Left Line
    const bottomL = { x: x, y: y + h };
    const topL = { x: x + (bend * 30), y: y }; // Top leans
    // Straight Right Line
    const bottomR = { x: x + w, y: y + h };
    const topR = { x: x + w + (bend * 30), y: y };
    ctx.beginPath();
    ctx.moveTo(bottomL.x, bottomL.y);
    // Left side: Line (or slight curve?)
    // User said "angled line segment", implies straight.
    // But bend logic implies curve.
    // Let's use simple line for leaning.
    ctx.lineTo(topL.x, topL.y);
    ctx.lineTo(topR.x, topR.y);
    ctx.lineTo(bottomR.x, bottomR.y);
    ctx.closePath();
};
const drawBentRoundedRect = (ctx, x, y, w, h, r, bend) => {
    // Similar: Leaning rect with rounded top
    const bendOffset = bend * 30;
    const bottomL = { x: x, y: y + h };
    const bottomR = { x: x + w, y: y + h };
    // Body top (start of arc)
    const topBodyL = { x: x + bendOffset, y: y + r };
    ctx.beginPath();
    ctx.moveTo(bottomL.x, bottomL.y);
    ctx.lineTo(topBodyL.x, topBodyL.y); // Left Line
    // Top Arc
    // Center of arc is mid-point of top line
    // Or just arc from topBodyL to topBodyR
    const centerX = topBodyL.x + r;
    const centerY = topBodyL.y;
    ctx.arc(centerX, centerY, r, Math.PI, 0);
    ctx.lineTo(bottomR.x, bottomR.y); // Right Line
    ctx.closePath();
};
const drawDeformedSemicircle = (ctx, r, bend) => {
    // Standard: Arc from PI to 0.
    // Deformed: Left side lower (y bigger), Right side higher (y smaller).
    // Center (0,0) is bottom.
    if (Math.abs(bend) < 0.1) {
        ctx.arc(0, 0, r, Math.PI, 0);
        return;
    }
    // Actually simpler: One cubic bezier from Left to Right?
    // CP1 (Left High), CP2 (Right High).
    // To make left lower, CP1.y should be closer to 0.
    // To make right higher, CP2.y should be further from 0.
    ctx.moveTo(-r, 0);
    ctx.bezierCurveTo(-r, -r + (bend * 50), // CP1: Left side flattened
    r, -r - (bend * 50), // CP2: Right side peaked
    r, 0 // End
    );
    // Close bottom
    ctx.lineTo(-r, 0);
};
const drawEye = (ctx, x, y, size, angle, state) => {
    ctx.save();
    ctx.translate(x, y);
    if (state === 'blink') {
        // Draw closed line
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.stroke();
        ctx.restore();
        return;
    }
    if (state === 'squint') {
        // Squinting (Narrow eye)
        // Draw flattened ellipse or just line with pupil?
        // "Mi yan" -> Squint/Narrow.
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        const pupilDist = size * 0.2;
        const pupilX = Math.cos(angle) * pupilDist;
        const pupilY = Math.sin(angle) * pupilDist;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(pupilX, pupilY, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }
    // Normal/Surprised/Scared
    ctx.fillStyle = 'white';
    ctx.beginPath();
    const currentSize = (state === 'surprised' || state === 'scared') ? size * 1.2 : size;
    ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    const pupilDist = currentSize * 0.3;
    let pupilX = Math.cos(angle) * pupilDist;
    let pupilY = Math.sin(angle) * pupilDist;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    const pupilSize = (state === 'surprised' || state === 'scared') ? size * 0.3 : size * 0.4;
    ctx.arc(pupilX, pupilY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};
const drawMouth = (ctx, y, type, isError, isSurprised) => {
    ctx.save();
    ctx.translate(0, y);
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    if (isSurprised || type === 'surprised') {
        // 'O' mouth
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    else if (isError) {
        // Trembling line
        ctx.beginPath();
        const tremble = Math.sin(Date.now() / 20) * 2;
        ctx.moveTo(-10, tremble);
        ctx.lineTo(10, -tremble);
        ctx.stroke();
    }
    else {
        // Normal
        ctx.beginPath();
        if (type === 'smile') {
            ctx.arc(0, 0, 10, 0, Math.PI); // smile
            ctx.fill();
        }
        else if (type === 'small') {
            ctx.arc(0, 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        else if (type === 'beak') {
            ctx.moveTo(0, 0);
            ctx.lineTo(20, 0); // Stick out right
            ctx.stroke();
        }
    }
    ctx.restore();
};
onMounted(() => {
    if (canvasRef.value) {
        ctx = canvasRef.value.getContext('2d');
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        handleResize();
        animate();
    }
});
onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    cancelAnimationFrame(animationId);
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "canvas-container" },
    ref: "containerRef",
});
/** @type {__VLS_StyleScopedClasses['canvas-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.canvas, __VLS_intrinsics.canvas)({
    ref: "canvasRef",
});
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};

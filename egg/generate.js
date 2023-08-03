console.log('start');

let simplifiedResult = true;
let p1, p2, boardSize, boardPlay, path;

function reset() {
	p1 = {
		type: 1,
		1: 3, // small
		2: 3, // medium
		3: 2 // large
	};

	p2 = {
		type: -1,
		1: 3, // small
		2: 3, // medium
		3: 2, // large
		nextP: p1
	};

	p1.nextP = p2;

	boardSize = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	boardPlay = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	path = {};
}

function getPlayerTurn(p1, p2) {
	let one = p1[3]+p1[2]+p1[1];
	let two = p2[3]+p2[2]+p2[1];
	if (one >= two) return p1;
	else return p2;
}

// 0 1 2
// 3 4 5
// 6 7 8
function check3WinnerAtPos(pos, boardP) {

	const row = Math.floor(pos/3)*3;
	if (boardP[row] === boardP[row+1] && boardP[row] === boardP[row+2]) return boardP[row];

	const col = pos%3;
	if (boardP[col] === boardP[col+3] && boardP[col] === boardP[col+6]) return boardP[col];

	// check diagonals
	if (pos === 0 || pos === 4 || pos === 8)
		if (boardP[0] === boardP[4] && boardP[4] === boardP[8]) return boardP[4];
	if (pos === 2 || pos === 4 || pos === 6)
		if (boardP[2] === boardP[4] && boardP[4] === boardP[6]) return boardP[4];

	return 0;
}

function tallyScore(boardP) {
	let one = 0;
	let two = 0;
	for (let pos = 0; pos < 9; pos++) {
		if (boardP[pos] === p1.type) one++;
		else if (boardP[pos] === p2.type) two++;
	}
	if (one > two) return p1.type;
	else if (two > one) return p2.type;
	else return 0;
}

function getSizeLetter(size) {
	if (size === 3) return "L";
	else if (size === 2) return "M";
	else if (size === 1) return "S";
	return "?";
}

function move(p, boardSize, boardPlay, path, depth) {
	let madeMove = false;
	let allSame = undefined;
	let guaranteed = undefined;
	for (let size = 1; size <= 3; size++) {
		if (p[size] === 0) continue;

		for (let pos = 0; pos < 9; pos++) {
			// check can make valid move at this position
			if (boardPlay[pos] === p.type || boardSize[pos] >= size) continue;
			madeMove = true;

			const notation = getSizeLetter(size)+(pos+1);
			const tmpSize = boardSize[pos];
			const tmpPlay = boardPlay[pos];

			// make move
			boardSize[pos] = size;
			boardPlay[pos] = p.type;
			p[size]--;

			// check if we won 3 in a row
			if (check3WinnerAtPos(pos, boardPlay)) {
				// undo move
				p[size]++;

				// record data
				path[notation] = p.type;

				boardSize[pos] = tmpSize;
				boardPlay[pos] = tmpPlay;
				return p.type; // guarantee winner. prune tree
			}

			// make move and recursive

			path[notation] = {};
			// let result = move(p.nextP, [...boardSize], [...boardPlay], path[notation], false);
			let result = move(p.nextP, boardSize, boardPlay, path[notation], depth+1);
			if (result === 't') { // tally score for this move
				result = tallyScore(boardPlay);
				path[notation] = result;
			}

			// record data
			if (allSame === undefined) allSame = result;
			if (allSame !== result) allSame = 0;

			if (result && simplifiedResult) path[notation] = result;

			// undo move
			boardSize[pos] = tmpSize;
			boardPlay[pos] = tmpPlay;
			p[size]++;

			if (result === p.type) guaranteed = result;
			if (guaranteed && depth !== 1) {
				return result; // guarantee winning move must take. prune tree
			}
		}
	}

	if (guaranteed) {
		return guaranteed;
	}

	if (!madeMove) {
		return 't'; // requires tallyScore
	}

	// there exists a guaranteed winner
	if (allSame) {
		return allSame;
	}

	return p.nextP.type; // no guaranteed winner
}

function loadNotation(notation) {
	reset();
	notation = notation.split(' ');
	let currentPlayer = 1;
	for (let note of notation) {
		const size = note[0].toUpperCase() === 'L' ? 3 : (note[0].toUpperCase() === 'M' ? 2 : 1);
		if (currentPlayer === 1) p1[size]--;
		else p2[size]--;

		const pos = parseInt(note[1])-1;
		boardSize[pos] = size;
		boardPlay[pos] = currentPlayer === 1 ? 1 : -1;

		currentPlayer*=-1;
	}
}

simplifiedResult = true;
reset();
// loadNotation('M7 M2 L2 L7 M9 M4 S8');
// loadNotation('M7 M2 L2 L7 M9 M4');

const noted = 'm4 l4 l5 m7';
loadNotation(noted);

let result = move(getPlayerTurn(p1, p2), boardSize, boardPlay, path, 1);
console.log(result);
console.log(JSON.stringify(path, null, '\t'));

function stringify(val, depth, replacer, space) {
    depth = isNaN(+depth) ? 1 : depth;
    function _build(key, val, depth, o, a) { // (JSON.stringify() has it's own rules, which we respect here by using it for property iteration)
        return !val || typeof val != 'object' ? val : (a=Array.isArray(val), JSON.stringify(val, function(k,v){ if (a || depth > 0) { if (replacer) v=replacer(k,v); if (!k) return (a=Array.isArray(v),val=v); !o && (o=a?[]:{}); o[k] = _build(k, v, a?depth:depth-1); } }), o||(a?[]:{}));
    }
    return JSON.stringify(_build('', val, depth), null, space);
}

const fs = require('fs');
// fs.writeFileSync(`./cache/${noted}.json`, stringify(path, 2, null, '\t'));

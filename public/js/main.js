// modo offline
firebase.firestore().enablePersistence()
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
  });

 // The default cache size threshold is 40 MB. Configure "cacheSizeBytes"
// for a different threshold (minimum 1 MB) or set to "CACHE_SIZE_UNLIMITED"
// to disable clean-up.
firebase.firestore().settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

firebase.firestore().enablePersistence()
// Subsequent queries will use persistence, if it was enabled successfully
/*==================================
=            navegation            =
==================================*/
function clickBtn(btn,def){
	let cont = 0
	btn.classList.add('btn-click-down','btn-click-up')
	btn.addEventListener('animationend',function(){
		btn.classList.remove('btn-click-down','btn-click-up')
		if (cont == 0 && def != null){
			def(btn)
		}
		cont++
	})
}

function togglemenuLevels(){
	document.querySelector("#levels-menu").classList.toggle('d-none')
	document.querySelector("#menu").classList.toggle('d-none')
}

function toggleLevelGame(){
	if (!document.querySelector("#main").classList.contains('d-none')){
		noModal()
		endGame()
	}
	document.querySelector("#levels-menu").classList.toggle('d-none')
	document.querySelector("#main").classList.toggle('d-none')
}

function toMenu()
{
	if (!document.querySelector("#main").classList.contains('d-none')){
		noModal()
		endGame()
	}
	document.querySelector("#menu").classList.toggle('d-none')
	document.querySelector("#main").classList.toggle('d-none')
}
/*=====  End of navegation  ======*/
/*================================
=            gameplay            =
================================*/
let cont_restart = 0
let cont_gameover = 0

function createLevel(event){
	let peons = document.querySelectorAll(".peon")
	if (peons.length != 0) peons.forEach(e=> e.remove())
	createGrid(5,'chess',document.querySelector('#main'))
	createFichas(levels[event.name])
	levelNow = event.name
	start()
	toggleLevelGame()
	setTimeGame()
	updateContRestar()
	noMov.add('d-none')
	document.querySelector("#level").innerText = "Level: "+(parseInt(event.name)+1)+"/"+levels.length
}

loadLevels()

function addModal(event){
	console.log("nice",event.target)
	Array.from(document.querySelectorAll(".contenedor")).filter(e => !e.classList.contains('d-none'))[0].style.opacity = 0.3
	document.querySelector(".modal").classList.remove('d-none')
}

function noModal(event){
	Array.from(document.querySelectorAll(".contenedor")).filter(e => !e.classList.contains('d-none'))[0].style.opacity = 1
	document.querySelector(".modal").classList.add('d-none')
}
function start(){
	let peones = document.querySelectorAll('.peon')
			peones.forEach(e => {
				e.addEventListener('touchstart',startMov)
				e.addEventListener('touchend',endMov)
			})
}
function reset(){
	document.querySelectorAll(".peon").forEach(e=> e.remove())
	createFichas(levels[levelNow])
	start()
	window.clearTimeout(timer)
	setTimeGame()
	noModal()
	levels[levelNow].cont_restart++
	updateContRestar()
	noMov.add('d-none')
}

function updateContRestar(){
	document.querySelector("#cont_restar").innerText = levels[levelNow].cont_restart
}

function endGame(){
	document.querySelector("#chess").remove()
	document.querySelectorAll(".peon").forEach(e=> e.remove())
	window.clearTimeout(timer)
}

function gameOver(ficha,side){
	gameover = true
	ficha.classList.add('animation-lose-'+side)
	window.clearTimeout(timer)
	console.log("gameover",gameover)
}

function winner(){
	document.querySelector("#chessC3").classList.replace('bg-lose','bg-win')
	window.clearTimeout(timer)
}
/*=====  End of gameplay  ======*/
/*=============================
=            timer            =
=============================*/
let timer = null
let seg = 0
let min = 0
let segHTML = document.querySelector("#seg")
let minHTML = document.querySelector("#min")
let levelNow = null
document.querySelector("#pause").addEventListener('click',addModal)
document.querySelector("#close").addEventListener('click',noModal)
function setTimeGame(){
	seg = 0
	min = 0
	segHTML.innerText = "0"+seg
	minHTML.innerText = "0"+min
	timer = window.setInterval(flowTime, 1000);
}

function flowTime(){
	seg++
	if (seg == 60){
		seg = 0
		segHTML.innerText = "00"
		min++
		minHTML.innerText = "0"+min
	}
	if (seg < 10){
		segHTML.innerText = "0"+seg
	}else{
		segHTML.innerText = seg
	}
}
/*=====  End of timer  ======*/
/*============================================
=            movimiento de fichas            =
============================================*/
let posInit_x = null;
let posFin_x = null
let posInit_y = null;
let posFin_y = null
let gameover = false
let win = false
let aux = 0
let intervalID = null
let contMov = 0;
let noMov = document.querySelector("#dontMov").classList
function startMov(event) {
  posInit_x = event.changedTouches[0].screenX
  posInit_y = event.changedTouches[0].screenY
}

function endMov(event) {
  posFin_x = event.changedTouches[0].screenX
  posFin_y = event.changedTouches[0].screenY
  let isVerticalMov = Math.abs(posFin_x - posInit_x) < Math.abs(posFin_y - posInit_y)
  let peon = event.target
  let cell = event.target.parentNode
  contMov = 0
  if (isVerticalMov){
  	if ((posInit_y - posFin_y) > 40){
  		verticalMov(cell,peon,-1,"top")
  	}else if((posFin_y - posInit_y) > 40){
  		verticalMov(cell,peon,1,"bottom")
  	}
  }else{
  	if ((posInit_x - posFin_x) > 40){
  		horizontalMov(cell,peon,-1,"left")
  	}else if((posFin_x - posInit_x) > 40){
  		horizontalMov(cell,peon,1,"right")
  	}
  }
}

function horizontalMov(celda,ficha,signo,side){
	let nextCell = document.querySelector("#chess"+celda.dataset.y+(parseInt(celda.dataset.x) + signo + (contMov * signo)))
	if (nextCell == undefined){
		gameOver(ficha,side)
		return;
	}
	if (nextCell.firstElementChild == null){
		win = false
		noMov.remove("d-none")
		ficha.classList.add('animation-mov-'+side)
		setTimeout(function(){
			nextCell.appendChild(ficha)
			resetclass(ficha)
			contMov++
			if (nextCell.name == "cell-win" && ficha.id == "win"){
				win = true
			}
			horizontalMov(celda,ficha,signo,side)
		},300)
	}else if(win){
		winner()
	}else{
		noMov.add("d-none")
	}
}

function verticalMov(celda,ficha,signo,side){
	if((celda.dataset.y.charCodeAt() + signo + (contMov * signo)) == 64){
		gameOver(ficha,side)
		return;
	}
	let nextCell = document.querySelector("#chess"+String.fromCharCode(celda.dataset.y.charCodeAt() + signo + (contMov * signo))+celda.dataset.x)
	if (nextCell == undefined){
		gameOver(ficha,side)
		return;
	}
	if (nextCell.firstElementChild == null){
		win = false
		noMov.remove("d-none")
		ficha.classList.add('animation-mov-'+side)
		setTimeout(function(){
			nextCell.appendChild(ficha)
			resetclass(ficha)
			contMov++
			if (nextCell.name == "cell-win" && ficha.id == "win"){
				win = true
			}
			verticalMov(celda,ficha,signo,side)
		},300)
	}else if(win){
		winner()
	}else{
		noMov.add("d-none")
	}
}

function resetclass(event){
	event.classList.remove("animation-mov-top","animation-mov-bottom","animation-mov-right","animation-mov-left")
}
/*=====  End of movimiento de fichas  ======*/
function createGrid(size, idName, elementAppend) {
	let gridBox = document.createElement('DIV')
			gridBox.classList.add('gridBox')
			gridBox.id = idName

	for (let i = 0; i < size; i++) {
		let row = document.createElement('DIV')
				row.classList.add('grid-row')
				row.id = `${idName}-grid-row-${i}`
		gridBox.appendChild(row)

		for (let j = 0; j < size; j++) {
			let cell = document.createElement('DIV')
					cell.classList.add('grid-cell')
					cell.id = `${idName}${String.fromCharCode(65 + i)}${j+1}`
					cell.dataset.y = String.fromCharCode(65 + i)
          cell.dataset.x = (j + 1); 
			((j + i) % 2) == 0 ? cell.classList.add('bg-white') : cell.classList.add('bg-black')
			if(j == i && j == 2){
				cell.classList.add('bg-lose')
				cell.name = "cell-win"
			}
			row.appendChild(cell)
		}
	}
	elementAppend.appendChild(gridBox)
}

function createFichas(level){
	level.peons_red_position.forEach(e =>{
		let fichaRed = document.createElement('DIV')
				fichaRed.classList.add('peon','peon-red')
		document.querySelector("#chess"+e).appendChild(fichaRed)
	})
	let fichaGreen = document.createElement('DIV')
				fichaGreen.classList.add('peon','peon-green')
				fichaGreen.id = "win"
		document.querySelector("#chess"+level.peon_green_position).appendChild(fichaGreen)
}

function loadLevels(){
	let h1 = document.createElement('H1')
		h1.innerText = "LEVELS"
	let div = document.createElement('DIV')
		div.classList.add('box-levels')
	let btn = document.createElement('BUTTON')
		btn.id = 'backMenu'
		btn.innerText = "Back Menu"
		btn.classList.add('btn')
		btn.addEventListener('click', () => clickBtn(btn,togglemenuLevels))
	levels.forEach((level,index) => {
		let btn = document.createElement('BUTTON')
			btn.classList.add('btn-level')
			btn.name = index
			btn.addEventListener('click',() => clickBtn(btn,createLevel))
		let p1 = document.createElement('P')
			p1.innerText = level.level
			p1.name = index
		let p2 = document.createElement('P')
			p2.innerText = level.mode
			p2.name = index
		let p3 = document.createElement('P')
			p3.innerText = level.time
			p3.name = index
		btn.appendChild(p1)
		btn.appendChild(p2)
		btn.appendChild(p3)
		div.appendChild(btn)
	})
	document.querySelector("#levels-menu").appendChild(h1)
	document.querySelector("#levels-menu").appendChild(div)
	document.querySelector("#levels-menu").appendChild(btn)
}

/*===============================
=            pruebas            =
===============================*/

/*=====  End of pruebas  ======*/

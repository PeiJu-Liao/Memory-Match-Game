"use strict"
// 定義遊戲的狀態state(狀態機)
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

// 撲克牌花色 
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

// TODO: View 和介面有關的程式碼
const view = {
  // 改成渲染"牌背"元件，遊戲初始化
  getCardElement(index) {
    return `<div class="card-item back" data-index="${index}">
    </div>`
  },
  // 牌面內容顯示
  getCardContent(index) {
    const number = this.transFormNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <p>${number}</p>
      <img src="${symbol}" alt="">
    <p>${number}</p>
    `
  },
  // 特殊數字轉換
  transFormNumber(number) {
    switch (number) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return number
    }
  },
  // 綁定監聽事件:點擊卡片-翻轉牌面
  // flipCards(...card) => 傳入的參數為值利用rest operator將其變為陣列傳入
  flipCards(...card) {
    // console.log(card)
    card.map((card) => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  // 呼叫顯示撲克牌
  displayCards(randomIndexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = randomIndexes.map(index => this.getCardElement(index)).join('')
  },
  pairCards(...card) {
    // console.log(card)
    card.map(card => card.classList.add('paired'))
  },
  // 撲克牌成功配對，分數+10
  renderScore(score) {
    document.querySelector('.score').innerHTML = `Score: ${score}`
  },
  // 撲克牌配對次數
  renderTriedTimes(times) {
    document.querySelector('.tried').innerHTML = `You've tried: ${times}`
  },
  // 配對失敗時，加入css動畫在牌面上
  appendWromgAnimation(...card) {
    card.map((card) => {
      card.classList.add('wrong')
      // 實際操作後，會發現已點擊過的卡片， 不會再發生css動畫。因為class="wromg"動畫仍然存在。
      // [一旦畫面跑完一輪，就把.wrong這個class拿掉]
      // anomationend => CSS動畫完成後觸發
      card.addEventListener('animationend', event => {
        event.target.classList.remove('wrong'), {
          once: true
        }
      })
    })
  },
  // 顯示遊戲結束的畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p> Game Completed! </p>
    <p> Score: ${model.score} </p>
    <p> You've tried: ${model.triedTimes} </p>
    <button type="button" class="again-btn">Play Again</button>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

// TODO: Model 集中管理資料的地方
const model = {
  // 代表被翻開的卡片空容器，之後推入的是<card>
  revealedCards: [],
  // 運用回傳true/flase值到controller裡設計卡片是否相符的狀態
  isRevealCardsMatches() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,
}
// TODO: Controller 負責管理流程、分派任務的元件
const controller = {
  // 初始狀態(目前)
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    return view.displayCards(utility.getRandomNumArray(52))
  },

  dispatchCardAction(card) {
    //卡片為"牌面"即終止程式；只需點擊"牌背"
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        // 只要切換SecondCardAwaits，嘗試次數就要+1
        view.renderTriedTimes(++model.triedTimes)
        //翻開第一張牌面b
        view.flipCards(card)
        // 將第一張牌面資料輸進model裡
        model.revealedCards.push(card)
        // 進到下一個狀態
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷翻開的兩張牌面，配對是否成功
        if (model.isRevealCardsMatches()) {
          // 配對成功，改變撲克牌底色 + 分數+10
          this.currentState = GAME_STATE.CardsMatched
          view.renderScore(model.score += 10)
          console.log(model.score)
          view.pairCards(...model.revealedCards) //spread oeprator取值傳入flipCards函式 
          // view.pairCards(model.revealedCards[0])
          // view.pairCards(model.revealedCards[1])
          model.revealedCards = []

          //FIXME: 
          if (model.score === 260) {
            console.log('showGameFinished')
            view.showGameFinished()
            this.currentState = GAME_STATE.GameFinished

            const againBtn = document.querySelector('.again-btn')
            againBtn.addEventListener('click', function (event) {
              event.target.parentElement.remove()
              console.log(this) //output <button>...</button>
              controller.startGame()
            })
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWromgAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log("this.currentState", this.currentState);
    console.log("revealCards", model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    // 這邊不能寫this.currentState，因為此時的this為呼叫他的setTimeOut
    controller.currentState = GAME_STATE.FirstCardAwaits
  },

  startGame() {
    controller.generateCards()
    model.score = 0
    model.triedTimes = 0
    model.revealedCards = []
    view.renderScore(model.score)
    view.renderTriedTimes(model.triedTimes)
    this.currentState = GAME_STATE.FirstCardAwaits
    document.querySelectorAll('.card-item').forEach((cardItem) => {
      cardItem.addEventListener('click', event => {
        return controller.dispatchCardAction(cardItem)
      })
    })
  }
}

// Utility[Fisher-Yates Shuffles] 像是一個外掛函示庫
const utility = {
  //製作一個每次呼叫都為隨機分配的陣列數字0-52
  getRandomNumArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
controller.startGame()





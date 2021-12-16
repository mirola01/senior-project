const add_nw_btn = document.querySelector('#add-new-btn');
const body_ = document.querySelector('.container');
const form = document.querySelector('.form');
const new_card = document.querySelector('#new-card-btn');

new_card.addEventListener('click', (e)=>{
    body_.classList.add('container-fade');
    form.style.display = 'block';
})

add_nw_btn.addEventListener('click', (e)=> {
    console.log(e)
    body_.classList.add('container-fade');
    form.style.display = 'block';
})

document.querySelector('#close-btn').addEventListener('click', (e)=>{
    console.log(e)
    body_.classList.remove('container-fade');
    form.style.display = 'none';
})

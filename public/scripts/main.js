const add_nw_btn = document.querySelector('#add-new-btn');
const body_ = document.querySelector('.container');
const form = document.querySelector('.form');


add_nw_btn.addEventListener('click', ()=> {
    body_.classList.add('container-fade');
    form.style.display = 'block';
})

document.querySelector('#close-btn').addEventListener('click', ()=>{
    body_.classList.remove('container-fade');
    form.style.display = 'none';
})


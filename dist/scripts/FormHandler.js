
import React, { useEffect } from 'react';

const FormHandler = () => {
  useEffect(() => {
    const add_nw_btn = document.querySelector('#add-new-btn');
    const body_ = document.querySelector('.container');
    const form = document.querySelector('#form');

    add_nw_btn.addEventListener('click', (e) => {
      console.log(e);
      body_.classList.add('container-fade');
      form.style.display = 'block';
    });

    document.querySelector('#close-btn').addEventListener('click', (e) => {
      console.log(e);
      body_.classList.remove('container-fade');
      form.style.display = 'none';
    });
  }, []);

  return null;
};

export default FormHandler;
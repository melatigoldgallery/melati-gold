let start = 0;
otomatis();

function otomatis()
{
	const sliders = document.querySelectorAll(".slider");

	for (let i = 0; i < sliders.length; i++)
	{
		sliders[i].style.display = "none";
	}

	if (start >= sliders.length)
	{
		start = 0;
	}

	sliders[start].style.display = "block";
	console.log("gambar ke" +start);
	start++;
	setTimeout(otomatis, 3000);
};

const navList = document.querySelector('.nav-list');
document.querySelector('#humberger-menu').onclick = () => {
	navList.classList.toggle('active');
};

const humberger = document.querySelector('#humberger-menu');
document.addEventListener('click', function (e){
	if (!humberger.contains(e.target) && !navList.contains(e.target)) {
		navList.classList.remove('active');
	}
});

const chatBox = document.querySelector('.chat-box');
document.querySelector('#chat').onclick = () => {
  chatBox.style.display = chatBox.style.display === 'none' ? 'block' : 'none';
};

const chatIcon = document.querySelector('#chat');
document.addEventListener('click', function (e) {
    if (!chatIcon.contains(e.target) && !chatBox.contains(e.target)) {
        chatBox.style.display = 'none';
    }
});


Array.from(document.querySelectorAll(".puzzle-row")).forEach((tr) => {
    const slug = tr.querySelector("td").innerText;
    if (localStorage.hasOwnProperty(`floralfacts_finished_${slug}`)) {
        tr.classList.add("completed");
    }
});

import tkinter as tk
from tkinter import messagebox

def show_results(results):
    root = tk.Tk()
    root.title("Phishing Detection Results")

    text_box = tk.Text(root, height=15, width=60, wrap='word')
    text_box.pack(padx=10, pady=10)

    for line in results:
        text_box.insert(tk.END, line + '\n')

    text_box.config(state=tk.DISABLED)

    root.mainloop()

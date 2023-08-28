"use client";

import { useEffect } from "react";
import Modal from 'react-modal';

interface CustomModalParams {
    children: React.ReactNode;
    isOpen: boolean;
    closeModal: () => void;
    title: string;
    primaryButton?: CustomModalAction;
    secondaryButton?: CustomModalAction;
}

interface CustomModalAction {
    label?: string;
    className?: string;
    onClick?: () => void;
}

Modal.setAppElement('#mainApp')

export default function CustomModal({
    children,
    isOpen,
    closeModal,
    title,
    primaryButton,
    secondaryButton,
} : CustomModalParams) {
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {document.body.style.overflow = 'unset'};
    }, [isOpen]);
    
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            shouldCloseOnOverlayClick={false}
            className="container w-full border border-slate-300 bg-white rounded-lg mx-auto m-4 h-max-[90%]"
        >
            <div className="flex flex-col">
                <div id="modal-header" className="flex justify-between p-6 border-b border-slate-300">
                    <h1 className="text-2xl font-semibold my-auto">{title}</h1>
                    <button className="h-8 w-8 bg-neutral-400 rounded-full text-white" onClick={closeModal}>&#x2715;</button>
                </div>
                <div id="modal-content" className="p-6">{children}</div>
                <div id="modal-footer" className=" px-6 py-4 border-t border-slate-300 flex justify-end">
                { secondaryButton && (
                    <button
                        className='px-4 py-2 rounded-md bg-red-200'
                        onClick={secondaryButton.onClick ?? closeModal}>
                        { secondaryButton.label ??  'Batal' }
                    </button>
                )}
                { primaryButton && (
                    <button
                        className="px-4 py-2 rounded-md bg-violet-300"
                        onClick={primaryButton.onClick ?? closeModal}
                    >
                        { primaryButton.label ??  'Simpan' }
                    </button>
                )}
                </div>
            </div>
        </Modal>
    );
    
}
/* eslint-disable react-hooks/exhaustive-deps */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

/** Get the parent origin */
const origin = window.location.ancestorOrigins[0] || document.referrer || '*'

/** Create a promise and it's associated resolve and reject functions */
const promisify = () => {
    let resolve
    let resolved = false
    let reject
    const promise = new Promise((res, rej) => {
        resolve = res
        reject = rej
    }).then((result) => {
        resolved = true
        return result
    })

    return { promise, resolve, resolved, reject }
}

/**
 * Returns a ref object that tracks the latest value.
 * This is quite handy for preventing reference change in handlers.
 * Similar to zustand transient updates
 */
const useTransientRef = (initialValue) => {
    const ref = useRef(initialValue)
    ref.current = initialValue
    return ref
}

/** Raw send message to the host */
const send = (message) => {
    window.parent.postMessage(message, origin)
}

/**
 * Send a message to the host
 * return a promise that will resolve when the message is received
 */
const resolvers = new Map()
const sendMessage = (message) => {
    const id = crypto.randomUUID()
    const { promise, resolve } = promisify()
    resolvers.set(id, resolve)

    send({ id, ...message })
    return promise
}

/** Send an ACK to the host */
const sendAck = (id) => {
    send({ id, type: 'ACK' })
}

const Bridge = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false)
    const location = useLocation()
    const locationRef = useTransientRef(location)

    /** Handle received messages from the host */
    const navigate = useNavigate()
    const handleMessage = useCallback((event) => {
        const { id, type, data } = event.data

        // - ACK
        if (type === 'ACK') {
            const resolve = resolvers.get(id)

            if (resolve) resolve(event.data)
            return
        }

        // - CONNECT
        if (type === 'CONNECT') {
            setIsConnected(true)
            sendAck(id)
            return
        }

        // - NAVIGATE
        if (type === 'NAVIGATE') {
            const nextLocation = data

            /** Only navigate if current location is not the same */
            const { current: location } = locationRef
            if (`${location.pathname}${location.search}` !== `${nextLocation.pathname}${nextLocation.search}`)
                navigate(nextLocation, { replace: true })

            sendAck(id)
            return
        }

        console.warn('[Bridge] unknown message', event)
        sendAck(event.data.id)
    }, [])

    /** Listen for messages from the host */
    useEffect(() => {
        // Listen for regular postMessage events
        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [handleMessage])

    useEffect(() => {
        if (isConnected) sendMessage({ type: 'CONNECTED' })
    }, [isConnected])

    /** Send a message to the host on every location change */
    useEffect(() => {
        if (isConnected) sendMessage({ type: 'NAVIGATE', data: location })
    }, [isConnected, location])

    /** Send a message to the host when the sidebar is toggled */
    const isSidebarOpen = useSelector((state) => state.customization.opened)
    useEffect(() => {
        if (isConnected) sendMessage({ type: 'SIDEBAR_TOGGLE', data: isSidebarOpen })
    }, [isConnected, isSidebarOpen])

    return isConnected ? children : <h1>407 Proxy Authentication Required</h1>
}

Bridge.propTypes = {
    children: PropTypes.node.isRequired
}

export default Bridge

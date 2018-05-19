/* eslint-env jest */

import React from 'react'
import TestRenderer from 'react-test-renderer'
import App from './App'

describe('App', () => {
  test('renders children correctly', () => {
    const wrapper = TestRenderer.create(<App />).toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})

import React from 'react';
import Text from './text';
import Image from './image';
import Select from './select';
import Check from './check';



  export const renderTextField = ({
    input,
    placeholder,
    label,
    meta: { touched, error }
    }) => (
      <Text
      placeholder={placeholder}
      label={label}
      errorText={touched && error}
      error={touched && error}
      {...input}
      />
    )

  export const renderImageField = ({
    input,
    placeholder,
    meta: { touched, error }
    }) => (
        <Image
            placeholder={placeholder}
            errorText={touched && error}
            error={touched && error}
            {...input}
        />
    )

  export const renderCheckField = ({
    input,
    label,
    meta: { touched, error }
    }) => (
          <Check
              label={label}
              errorText={touched && error}
              error={touched && error}
              {...input}
          />
    )

    export const renderSelectField = ({
    input,
    placeholder,
    label,
    meta: { touched, error },
    children,
    id
    }) => (
          <Select
              placeholder={placeholder}
              label={label}
              id={id}
              errorText={touched && error}
              error={touched && error}
              {...input}
          >
              {children}
          </Select>
    )
